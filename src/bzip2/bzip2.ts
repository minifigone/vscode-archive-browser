import * as fs from 'fs';
import * as pathlib from 'path';
import * as tmp from '../temp_dir';
import {decomp} from '../extension';
import {ExtractionInfo} from '../file_info';
import { ErrorType } from 'typescript-logging';
let bzip2 = require('bzip2');

/**
 * Function Name: extract_bzip2()
 * 
 * @param path (String) Path to a .bz2 file
 * @returns null if path is nonexistent, ExtractionInfo object otherwise.
 * 
 * Summary: This function takes a path (presumably to a .bz2 file) and extracts it.
 * 
 */
export function extract_bzip2(path: string){
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
		let ret = bzip2.array(archive_file);
		infl = bzip2.simple(ret);
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
