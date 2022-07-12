import * as fs from 'fs';
import * as pathlib from 'path';
import * as tmp from '../temp_dir';
import {decomp} from '../extension';
import {ExtractionInfo} from '../file_info';
import { ErrorType } from 'typescript-logging';
let lzma = require('lzma');

//Declare stuff here

export function extract_lzma(path: string): ExtractionInfo | null {
	var archive_file: Buffer;

	if(fs.existsSync(path)){
		archive_file = fs.readFileSync(path);
	}
	else{
		decomp.warn("File at path " + path + "does not exist.");
		return null;
	}
	var temp_path = pathlib.parse(path);
	var new_path = tmp.create_temp_dir() + '/' + temp_path.name;
	var infl;

	//Make a new directory in the temp directory if not already there.
	if(!fs.existsSync(new_path)){
		fs.mkdirSync(new_path);
	}

	//Unzip the file
	try{
		infl = lzma.decompress(archive_file);
	}
	catch(err){
		decomp.error("Error extracting", err as ErrorType);
	}

	//Write unzipped buffer to a file
	fs.writeFileSync(new_path + "/" + temp_path.name, infl);

	//Create an ExtractionInfo object and return
	var info = new ExtractionInfo(path);
	info.extractedPath = new_path;
	let file_stats = fs.statSync(new_path + "/" + temp_path.name);
	info.decompressedSize = file_stats["size"];
	info.fileCount = 1;

	return info;
}
