import * as fs from 'fs';
import {inflateSync, inflateRawSync} from 'zlib';
import * as pathlib from 'path';
import * as tmp from '../temp_dir';
import {decomp} from '../extension';
import {ExtractionInfo} from '../file_info';

// zip file header/record signatures.
const local_header_signature: Buffer = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const data_descriptor_signature: Buffer = Buffer.from([0x50, 0x4b, 0x07, 0x08]);
const central_header_signature: Buffer = Buffer.from([0x50, 0x4b, 0x01, 0x02]);
const central_dir_end_signature: Buffer = Buffer.from([0x50, 0x4b, 0x05, 0x06]);

// values the ZIP format uses for different compression methods.
// not all possible values are/will be supported.
const enum CompressionMethod {
	STORE = 0,
	DEFLATE = 8,
	BZIP2 = 12,
	LZMA = 14,
}

/**
 * Extract a .zip file.
 * @param path path to file to extract.
 * @returns null if path is nonexistent, ExtractionInfo object otherwise.
 */
export function extract_zip(path: string): ExtractionInfo | null {
	var archive_file: Buffer;

	if (fs.existsSync(path)) {
		archive_file = fs.readFileSync(path);
	} else {
		decomp.warn("Provided path does not exist: " + path);
		return null;
	}

	var total_expanded_size = 0;

	var path_object = pathlib.parse(path);
	// make a directory in the temp directory.
	fs.mkdirSync(tmp.create_temp_dir() + "/" + path_object.name);

	// find the end-of-central-directory record.
	// have to use a loop method here because the comment length is not static.
	var end_of_central_directory;
	var i = archive_file.byteLength;
	while (true) {
		var next_four = archive_file.slice(i - 4, i);
		if (next_four.equals(central_dir_end_signature)) {
			end_of_central_directory = archive_file.slice(i - 4, archive_file.byteLength);
			break;
		}
		i--;
	}
	let num_cd_records = array_to_int(end_of_central_directory.slice(10, 12)); // not handling multiple-part zips.
	let cd_size = array_to_int(end_of_central_directory.slice(12, 16));
	let cd_start = array_to_int(end_of_central_directory.slice(16, 20));

	var central_directory = archive_file.slice(cd_start, cd_start + cd_size);

	// iterate over cd records.
	var cd_offset = 0;
	for (var i = 0; i < num_cd_records; i++) {
		// there are some magic numbers around these parts. idk if we should make constants for every possible offset.
		// looking at the cd record info.
		var cdfh_file_name_length = array_to_int(central_directory.slice(cd_offset + 28, cd_offset + 30));
		var cdfh_extra_field_length = array_to_int(central_directory.slice(cd_offset + 30, cd_offset + 32));
		var cdfh_file_comment_length = array_to_int(central_directory.slice(cd_offset + 32, cd_offset + 34));
		var cdfh_length = 46 + cdfh_file_name_length + cdfh_extra_field_length + cdfh_file_comment_length;
		var cd_file_header = central_directory.slice(cd_offset, cd_offset + cdfh_length);

		var compression_method = array_to_int(cd_file_header.slice(10, 12));
		var compressed_size = array_to_int(cd_file_header.slice(20, 24));
		var uncompressed_size = array_to_int(cd_file_header.slice(24, 28));
		total_expanded_size += uncompressed_size;
		var lfh_offset = array_to_int(cd_file_header.slice(42, 46));

		// looking at the local record info.
		var lfh_file_name_length = array_to_int(archive_file.slice(lfh_offset + 26, lfh_offset + 28));
		var lfh_extra_field_length = array_to_int(archive_file.slice(lfh_offset + 28, lfh_offset + 30));
		var lfh_length = 30 + lfh_file_name_length + lfh_extra_field_length;
		var filename = archive_file.slice(lfh_offset + 30, lfh_offset + 30 + lfh_file_name_length);

		var data = archive_file.slice(lfh_offset + lfh_length, lfh_offset + lfh_length + compressed_size);

		switch (compression_method) {
			case (CompressionMethod.STORE): {
				if (uncompressed_size === 0) {
					// if the file is zero size it's probably a directory, so make a directory.
					fs.mkdirSync(tmp.create_temp_dir() + "/" + path_object.name + "/" + filename, {recursive: true});
				} else {
					if (!fs.existsSync(tmp.create_temp_dir() + "/" + path_object.name + "/" + pathlib.parse(filename.toString()).dir)) {
						fs.mkdirSync(tmp.create_temp_dir() + "/" + path_object.name + "/" + pathlib.parse(filename.toString()).dir, {recursive: true});
					}
					// otherwise it was actually stored uncompressed.
					fs.writeFileSync(tmp.create_temp_dir() + "/" + path_object.name + "/" + filename, data);
				}
				break;
			}
			case (CompressionMethod.DEFLATE): {
				var infl;
				try {
                    decomp.info("Method: inflateSync");
					infl = inflateSync(data);
				} catch { // if it can't be inflated, try inflate raw.
					try {
                        decomp.info("Method: inflateRawSync");
						infl = inflateRawSync(data);
					} catch (err) {
                        decomp.info("Method: Error");
						decomp.error("Error extracting " + filename + "from " + path, err);
					}
				}
				if (infl) {
                    if (infl.length === 0) {
				        // if the file is zero size it's probably a directory, so make a directory.
					    fs.mkdirSync(tmp.create_temp_dir() + "/" + path_object.name + "/" + filename, {recursive: true});
				    } else {
					    if (!fs.existsSync(tmp.create_temp_dir() + "/" + path_object.name + "/" + pathlib.parse(filename.toString()).dir)) {
						    fs.mkdirSync(tmp.create_temp_dir() + "/" + path_object.name + "/" + pathlib.parse(filename.toString()).dir, {recursive: true});
					    }
					    // otherwise it was actually stored uncompressed.
					    fs.writeFileSync(tmp.create_temp_dir() + "/" + path_object.name + "/" + filename, infl);
				    }
				}
				break;
			}
			case (CompressionMethod.BZIP2): {
				// TODO: add BZIP2 decompression when it's added for general decompression.
				decomp.warn(filename + " compressed with BZIP2 compression, which is not yet supported for ZIP");
				break;
			}
			case (CompressionMethod.LZMA): {
				// TODO: add LZMA decompression when it's added for 7Z files.
				decomp.warn(filename + " compressed with LZMA compression, which is not yet supported for ZIP");
				break;
			}
			default: {
				decomp.warn(filename + " compressed with unsupported compression method " + compression_method);
				break;
			}
		}

		cd_offset += cdfh_length;
	}

	var info = new ExtractionInfo(path);
	info.extractedPath = tmp.create_temp_dir() + "/" + path_object.name;
	info.decompressedSize = total_expanded_size;

	return info;
}

// convert a little-endian-byte-order array to an int.
// (by working backwards and pretending it's big-endian).
// takes in a Buffer and returns an Integer of some sort.
export function array_to_int(arr: Buffer) {
	var out = 0x00000000;
	for (var i = arr.byteLength - 1; i >= 0; i--) {
		out = out << 8;
		out = out | arr[i];
	}
	return out;
}
