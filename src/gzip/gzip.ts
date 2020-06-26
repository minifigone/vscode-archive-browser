import * as fs from 'fs';
import {inflateSync, inflateRawSync, gunzipSync} from 'zlib';
import * as pathlib from 'path';
import * as tmp from '../temp_dir';
import {decomp} from '../extension';
import {ExtractionInfo} from '../file_info';

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
    var n_path = new_path + '\\' + temp_path.base;

    decomp.info("path: " + path);
    decomp.info("n_path: " + n_path);
    decomp.info("new_path: " + new_path);
    decomp.info("Shit: " + new_path + "\\" + temp_path.name);

    fs.copyFileSync(path, n_path);
    var infl;
    //infl = gunzipSync(n_path);
    //fs.writeFileSync(new_path + "\\" + temp_path.name, infl);

    
    try{
        decomp.info("Trying inflateSync");
        infl = inflateSync(new_path);
    } catch{
        try{
            decomp.info("Trying inflateRawSync");
            infl = inflateRawSync(new_path);
        }
        catch(err){
            decomp.error("Error extracting", err);
        }
    }

    decomp.info("Writing...");
    fs.writeFileSync(new_path + "\\" + temp_path.name, infl);
    decomp.info("Done writing");

    var info = new ExtractionInfo(path);
    //These errors will be fixed once the PR for #31/32 is merged in
    //info.extractedPath = new_path;
    //let file_stats = fs.statSync(new_path);
    //info.decompressedSize = file_stats["size"];

}
