import * as vscode from 'vscode';

// enum of supported filetypes & their extensions.
export enum FileTypes {
	ZIP = ".zip",
	TAR = ".tar",
	GZIP = ".gz",
	BZIP2 = ".bz2",
	JAR = ".jar", // java archive
	AAR = ".aar", // android archive
	SEVENZIP = ".7z", // 7Zip
}

export function extract_file_at_path(path: string) {
	let lpath = path.toLowerCase(); // make lowercase for extension matching but don't lose original.
	let pattern = /(\.[a-zA-Z0-9]+)/g; // match a group of characters after a '.', like a file extension (or several).
	let matches = lpath.match(pattern);

	if (matches) {
		// there was at least some sort of extension
		let extension = matches[matches?.length - 1];
		var secondary_extension;
		if (extension.length > 1) {
			// either something named with extra '.'s or something like .tar.gz
			secondary_extension = matches[matches.length - 2];
		}

		// the monolith of filetype matching (:
		if (extension === FileTypes.ZIP) {
			// .zip
			console.log("Extracting %s file", extension)
		} else if (extension === FileTypes.TAR) {
			// .tar
			console.log("Extracting %s file", extension)
		} else if (extension === FileTypes.GZIP) {
			if (secondary_extension && secondary_extension === FileTypes.TAR) {
				// .tar.gz
				console.log("Extracting %s%s file", secondary_extension, extension)
			} else {
				// .gz
				console.log("Extracting %s file", extension)
			}
		} else if (extension === FileTypes.BZIP2) {
			if (secondary_extension && secondary_extension === FileTypes.TAR) {
				// .tar.bz2
				console.log("Extracting %s%s file", secondary_extension, extension)
			} else {
				// .bz2
				console.log("Extracting %s file", extension)
			}
		} else if (extension === FileTypes.JAR) {
			// .jar
			console.log("Extracting %s file", extension)
		} else if (extension === FileTypes.AAR) {
			// .aar
			console.log("Extracting %s file", extension)
		} else if (extension === FileTypes.SEVENZIP) {
			// .7z
			console.log("Extracting %s file", extension)
		} else {
			console.log("Unsupported file type %s", extension);
		}
	}
}
