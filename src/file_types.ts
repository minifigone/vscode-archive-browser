import * as vscode from 'vscode';
import * as pathlib from 'path';
import {ExtractionInfo} from "./file_info";
import {extract, decomp, dir} from "./extension";
import {extract_zip} from './zip/zip';
import {extract_gzip} from './gzip/gzip';
import {extract_tar} from './tar/tar';

// supported file extensions that handle archiving or archiving and compression.
export enum ArchiveType {
	ZIP = ".zip",
	TAR = ".tar",
	JAR = ".jar", // java archive
	AAR = ".aar", // android archive
	SEVENZIP = ".7z", // 7Zip
	TGZ = ".tgz", // .tar.gz shortening
	TBZ2 = ".tbz2", // .tar.bz2 shortening
}

// supported file extensions that handle only compression.
export enum CompressionType {
	GZIP = ".gz",
	BZIP2 = ".bz2",
}

// program flow controlled by file types.
export function extract_file_at_path(path: string) {
	let extension = get_file_extension(path);
	var info;

	if (extension !== "") {
		var new_path = ""; // TODO: make this an actual value in .bz2 below once decompression returns are known.

		// handle compression only types first.
		if ((<any>Object).values(CompressionType).includes(extension)) { // TypeScript -- this shouldn't be this ugly.
			if (extension === CompressionType.GZIP) {
				// .gz
				decomp.info("Decompressing " + extension + " file");
				info = extract_gzip(path);
				if(info !== null){
					new_path = info?.extractedPath;
				}
			} else if (extension === CompressionType.BZIP2) {
				// .bz2
				decomp.info("Decompressing " + extension + " file");
			}

			extension = get_file_extension(new_path); // if we need to handle a tarball.
		}

		// handle archive or combined types.
		if (extension === ArchiveType.ZIP) {
			// .zip
			extract.info("Extracting " + extension + " file");
			info = extract_zip(path);
		} else if (extension === ArchiveType.TAR) {
			// .tar
			//TODO: Check if there is a value in new_path that needs to be extracted
			extract.info("Extracting " + extension + " file");
			if (new_path) {
				let new_path_object = pathlib.parse(new_path);
				new_path = new_path + "/" + new_path_object.base;
				info = extract_tar(new_path);
			} else {
				info = extract_tar(path);
			}
		} else if (extension === ArchiveType.JAR) {
			// .jar
			extract.info("Extracting " + extension + " file");
		} else if (extension === ArchiveType.AAR) {
			// .aar
			extract.info("Extracting " + extension + " file");
		} else if (extension === ArchiveType.SEVENZIP) {
			// .7z
			extract.info("Extracting " + extension + " file");
		} else {
			extract.warn("File type " + extension + " is not supported");
		}

	} else {
		extract.warn("Unable to determine file type", extract);
	}
}

// returns the last group matching a regex that matches file extensions in a string.
function get_file_extension(path: string): string {
	let lpath = path.toLowerCase(); // make lowercase for extension matching but don't lose original.
	let pattern = /(\.[a-z0-9]+)/g; // match a group of characters after a '.', like a file extension (or several).
	let matches = lpath.match(pattern);

	var ext;
	if (matches) {
		return matches[matches?.length - 1]; // only return one file extension. can run again to check for more.
	} else {
		return ""; // if no extension, return empty string.
	}
}
