import * as fs from 'fs';
import * as pathlib from 'path';
import * as tmp from '../temp_dir';
import {decomp} from '../extension';
import {ExtractionInfo} from '../file_info';

const block_size = 512;

/**
 * Extract a .tar file.
 * @param path path to file to extract
 * @returns null if path is nonexistent, ExtractionInfo object otherwise.
 */
export function extract_tar(path: string): ExtractionInfo | null {
	var archive_file: Buffer;

	if (fs.existsSync(path)) {
		archive_file = fs.readFileSync(path);
	} else {
		decomp.warn("Provided path does not exist: " + path);
		return null;
	}

	var path_object = pathlib.parse(path);
	fs.mkdirSync(tmp.create_temp_dir() + "/" + path_object.name);

	var processed_bytes = 0;

	while (true) {
		let header = archive_file.slice(processed_bytes, processed_bytes + block_size);

		if (header[0] === 0 && header[148] === 0 && header[block_size - 1] === 0) {
			break;
		}

		let filename = header.slice(0, 100).toString();

		// check for ustar
		let ustar = false;
		let ustar_indicator = header.slice(257, 262);
		if (ustar_indicator.toString() === "ustar") {
			filename = header.slice(345, 500).toString() + filename;
			ustar = true;
		}
		filename = filename.replace(/\0/g, "");

		if (ustar && header[156] === 53) {
			// it's a directory!
			fs.mkdirSync(tmp.create_temp_dir() + "/" + path_object.name + "/" + filename, {recursive: true});
			processed_bytes += block_size;
		} else if (header[156] === 0 || header[156] === 48) {
			// it's a regular file.
			let length = octal_ascii_to_int(header.slice(124, 135));

			let data = archive_file.slice(processed_bytes + block_size, processed_bytes + block_size + length);
			fs.writeFileSync(tmp.create_temp_dir() + "/" + path_object.name + "/" + filename, data);

			processed_bytes += block_size + length;
			processed_bytes += block_size - (length % block_size); // tars are blocked.
		}
	}

	var info = new ExtractionInfo(path);
	info.extractedPath = tmp.create_temp_dir() + "/" + path_object.name;
	return info;
}

// convert a string of octal digits into an int.
// 48 is the ascii value of 0; subtracting it from a numerical ascii symbol gives you the symbol's value.
export function octal_ascii_to_int(arr: Buffer) {
	let order = arr.length - 1;
	let a = 0; // accumulator
	for (var i = 0; i < arr.length; i++) {
		a += (arr[i] - 48) * (8 ** order);
		order--;
	}
	return a;
}