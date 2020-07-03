import * as vscode from 'vscode';
import * as fs from 'fs';
import {basename} from 'path';
import {extract} from "./extension";

/**
 * Class Name: ExtractionInfo
 * 
 * Summary: This class contains all the information about an extracted file and the 
 * functions to update that information. 
 * 
 */
export class ExtractionInfo{
    //Variables

    private filename: string = "";
    private compressed_path: string = "";
    private extracted_path: string = "";
    private compressed_size: number = -1;
    private decompressed_size: number = -1;
    private replace = /\\/gi;

    //-----------------------------------------------------------------------------------
    //Constructor

    /**
     * Function Name: (Constructor) ExtractionInfo()
     * 
     * @param path (String) The compressed_path as a string
     * 
     * Summary: This creates a new instance of the ExtractionInfo class and initalizes
     * the variables. 
     * 
     */
    constructor(path: string){
        this.compressed_path = this.process_path(path);
        this.filename = basename(path);
        this.filename = this.filename.split(".", 1).toString();

        //Get file size from provided path
        this.compressed_size = this.get_file_size(this.compressed_path);

        //Save to file
        this.generate_file();
    }

    //-----------------------------------------------------------------------------------
    //Get/Set

    /**
     * Function Name: compressedPath()
     * 
     * Summary: Returns the compressed_path variable
     * 
     */
    get compressedPath(): string{
        return this.compressed_path;
    }

    /**
     * Function Name: extractedPath()
     * 
     * Summary: Returns the extracted_path variable
     * 
     */
    get extractedPath(): string{
        return this.extracted_path;
    }

    /**
     * Function Name: compressedSize()
     * 
     * Summary: Returns the compressed_size variable
     * 
     */
    get compressedSize(): number{
        return this.compressed_size;
    }

    /**
     * Function Name: decompressedSize()
     * 
     * Summary: Returns the decompressed_size variable
     * 
     */
    get decompressedSize(): number{
        return this.decompressed_size;
    }

    /**
     * Function Name: updateCompressedPath()
     * 
     * @param newPath (String) The new compressed_path
     * 
     * Summary: Updates this instances compressed_path string
     * 
     */
    set compressedPath(newPath: string){
        this.compressed_path = this.process_path(newPath);
        this.compressed_size = this.get_file_size(this.compressed_path);
        this.generate_file();
    }

    /**
     * Function Name: updateExtractedPath()
     * 
     * @param newPath (String) The new extracted_path
     * 
     * Summary: Updates this instances extracted_path string
     * 
     */
    set extractedPath(newPath: string){
        this.extracted_path = this.process_path(newPath);
        // this.decompressed_size = this.get_file_size(this.extracted_path);
        this.generate_file();
    }

    /**
     * @param newVal (number) new decompressed size value.
     * 
     * Summary: Updates this.decompressed_size.
     */
    set decompressedSize(newVal: number) {
        this.decompressed_size = newVal;
        this.generate_file();
    }

    //-----------------------------------------------------------------------------------
    //Functions

    /**
     * Function Name: process_path()
     * 
     * @param path (String)A file path as a string. 
     * 
     * Summary: This function takes a filepath and replaces all "\" characters with "\\" to 
     * prevent string escape errors in the .json file. (Only really needed on windows systems)
     * 
     */
    private process_path(path: string): string{
        return path.replace(this.replace, "\\\\");
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
    private get_file_size(path: string){
        if(fs.existsSync(path)){
            let file_stats = fs.statSync(path);
            return file_stats["size"];
        }
        else{
            extract.warn("File at " + path + " doesn't exist.");
            return -1;
        }
    }

    /**
     * Function Name: check_directory()
     * 
     * Summary: Checks if the current workspace contains the ".vscode\archive-browser" directory. 
     * If not then it creates them and returns the full path to that directory.
     * 
     */
    private check_directory(): string{
        let workspace_path = vscode.workspace.rootPath + "\\.vscode";
        if(!fs.existsSync(workspace_path)){
            fs.mkdir(workspace_path, { recursive: false }, (err) =>{
                if(err){
                    throw err;
                }
            });
        }
        workspace_path = workspace_path + "\\archive-browser";
        if(!fs.existsSync(workspace_path)){
            fs.mkdir(workspace_path, { recursive: false }, (err) =>{
                if(err){
                    throw err;
                }
            });
        }
        return workspace_path;
    }

    /**
     * Function Name: generate_file_info()
     * 
     * Summary: Creates a json file with info on the extracted file in the current 
     * workspace's ".vscode\archive-browser" directory. 
     * 
     */
    private generate_file(){
        let workspace_path = this.check_directory() + "\\" + this.filename + ".json";

        let data = "{\"compressed_path\":\"" + this.compressed_path + "\", \"extracted_path\":\"" + this.extracted_path + "\",\"size\":{\"compressed\":\"" + this.compressed_size 
        + "\",\"decompressed\":\"" + this.decompressed_size + "\"}}";

        fs.writeFileSync(workspace_path, data);
    }

}
