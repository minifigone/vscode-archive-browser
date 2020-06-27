import * as fs from 'fs';
import {gunzipSync} from 'zlib';
import * as pathlib from 'path';
import * as tmp from '../temp_dir';
import {decomp} from '../extension';
import {ExtractionInfo} from '../file_info';

/**
 * Function Name: extract_gzip()
 * 
 * @param path (String) Path to a .gz file
 * @returns null if path is nonexistent, ExtractionInfo object otherwise.
 * 
 * Summary: This function takes a path (presumably to a .gz file) and makes 
 * a copy in a temp folder, extracts it and removes the copied .gz file.
 * 
 */
export function extract_gzip(path: string){
    var archive_file: Buffer;

    if(fs.existsSync(path)){
        archive_file = fs.readFileSync(path);
    }
    else{
        decomp.warn("File at path " + path + "does not exist.");
        return null;
    }
    var temp_path = pathlib.parse(path);
    var new_path = tmp.create_temp_dir() + '\\' + temp_path.name;

    //Make a new directory in the temp directory if not already there.
    if(!fs.existsSync(new_path)){
        fs.mkdirSync(new_path);
    }

    //Copy the .gz file to the temp directory and creates a buffer
    var temp_archive = new_path + '\\' + temp_path.base;
    var infl;
    var buf: Buffer;
    fs.copyFileSync(path, temp_archive);
    buf = fs.readFileSync(temp_archive);

    //Unzip the file
    try{
        infl = gunzipSync(buf);
    }
    catch(err){
        decomp.error("Error extracting", err);
    }

    //Write unzipped buffer to a file & delete the .gz file
    fs.writeFileSync(new_path + "\\" + temp_path.name, infl);
    fs.unlinkSync(temp_archive);

    //Create an ExtractionInfo object and return
    var info = new ExtractionInfo(path);
    info.extractedPath = new_path;
    let file_stats = fs.statSync(new_path + "\\" + temp_path.name);
    info.decompressedSize = file_stats["size"];

    return info;
}
