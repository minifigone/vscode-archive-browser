import * as fs from 'fs';
//import {gunzipSync} from 'zlib';
const dec = require('decompress');
const decBzip2 = require('decompress-bzip2');
//import * as dec from 'decompress';
import * as pathlib from 'path';
import * as tmp from '../temp_dir';
import {decomp} from '../extension';
import {ExtractionInfo} from '../file_info';

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

    //Make a new directory in the temp directory if not already there.
    if(!fs.existsSync(new_path)){
        fs.mkdirSync(new_path);
    }

    //Unzip the file
    try{
        //dec(path, new_path + "/" + temp_path.name);
        dec(path, new_path + "/" + temp_path.name, {
            plugins: [
                decBzip2({path: path})
            ]
        });
    }
    catch(err){
        decomp.error("Error extracting", err);
    }

    //Create an ExtractionInfo object and return
    var info = new ExtractionInfo(path);
    info.extractedPath = new_path;
    let file_stats = fs.statSync(new_path + "/" + temp_path.name);
    info.decompressedSize = file_stats["size"];

    return info;
}
