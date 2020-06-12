import * as vscode from 'vscode';
import * as fs from 'fs';
import {extract} from "./extension";

//TODO: Document function
export function generate_file_info(file_path: string, size_comp: number, size_decomp: number){

    let workspace_path = vscode.workspace.rootPath + "\\extraction_info.json";

    //TODO: Fix issue where file_path is an invalid string in json. EX: "C:\Users" -> "C:\\Users"
    let data = "{\"path\":\"" + file_path + "\",\"size\":{\"compressed\":\"" + size_comp + "\",\"decompressed\":\"" 
    + size_decomp + "\"}}";

    fs.writeFileSync(workspace_path, data);

    return 0;
}

/**
 * Function Name: get_file_size()
 * 
 * @param path (String)Path to a file.
 * 
 * Summary: Checks if a file exists, returns -1 if not and returns the file
 * size if it does exists. 
 * 
 */
export function get_file_size(path: string){

    if(fs.existsSync(path)){
        let file_stats = fs.statSync(path);
        return file_stats["size"];
    }
    else{
        extract.warn("File at " + path + " doesn't exist.");
        return -1;
    }

}