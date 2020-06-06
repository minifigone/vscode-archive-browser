//TODO: Document code
import * as vscode from 'vscode';
import * as os from 'os';
import * as fs from 'fs';

//Functions

//TODO: Complete function
export function create_temp_dir(){
    let default_temp_dir: string = os.tmpdir();

    console.log(default_temp_dir);

    return 0;
}

//This function might not be needed. 
function get_os(){
    let OS_Type: string = "Unknown";

    OS_Type = "New String";

    OS_Type = os.type();

    return OS_Type;
}
