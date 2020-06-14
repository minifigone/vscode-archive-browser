import * as os from 'os';
import * as fs from 'fs';
import * as vscode from 'vscode';
import {dir} from "./extension";

/**
 * Function Name: create_temp_dir()
 * 
 * Inputs: N/A
 * Outputs: (String)Temp directory for extracted archives 
 * 
 * Summary: This function checks the "/archives" directory exists in the 
 * default temp directory. If not then it creates it. 
 * 
 */
export function create_temp_dir(){
    let temp_dir: string = os.tmpdir() + '\\archive';

    if(fs.existsSync(temp_dir)){
        dir.warn("Temp direcory already exists");
    }
    else{
        dir.info("Creating Temp directory named: archive");
        fs.mkdir(temp_dir, { recursive: false }, (err) =>{
            if(err){
                throw err;
            }
        });
    }

    //connects temp directory in 
    vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.file(temp_dir)});
    return temp_dir;
}
