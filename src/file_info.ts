import * as vscode from 'vscode';
import * as fs from 'fs';
import * as pathlib from 'path';
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
    private file_count: number = -1;
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
        this.filename = pathlib.basename(path);
        this.filename = this.filename.split(".", 1).toString();

        //Checking if a .json file already exists
        let workspace_path = this.check_directory() + "/" + this.filename + ".json";
        let ret = this.load(workspace_path);
        if(ret===-1){
            //Get file size from provided path
            this.compressed_size = this.get_file_size(this.compressed_path);

            //Save to file
            this.generate_file();
        }
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
     * Function Name: fileCount
     * 
     * Summary: Returns the file_count variable
     * 
     */
    get fileCount(): number{
        return this.file_count;
    }

    /**
     * Function Name: CompressedPath()
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
     * Function Name: ExtractedPath()
     * 
     * @param newPath (String) The new extracted_path
     * 
     * Summary: Updates this instances extracted_path string
     * 
     */
    set extractedPath(newPath: string){
        this.extracted_path = this.process_path(newPath);
        this.generate_file();
    }

    /**
     * Function Name: decompressedSize()
     * 
     * @param newVal (number) new decompressed size value.
     * 
     * Summary: Updates this.decompressed_size.
     * 
     */
    set decompressedSize(newVal: number) {
        this.decompressed_size = newVal;
        this.generate_file();
    }

    /**
     * Function Name: fileCount()
     * 
     * @param newVal (number) new file_count value
     * 
     * Summary: Updates this.file_count
     * 
     */
    set fileCount(newVal: number){
        this.file_count = newVal;
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
        return path.replace(this.replace, "/");
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
        let workspace_path = vscode.workspace.rootPath + "/.vscode";
        if(!fs.existsSync(workspace_path)){
            fs.mkdir(workspace_path, { recursive: false }, (err) =>{
                if(err){
                    throw err;
                }
            });
        }
        workspace_path = workspace_path + "/archive-browser";
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
        let workspace_path = this.check_directory() + "/" + this.filename + ".json";

        let jdata = {
            compressed_path: this.compressedPath, 
            extracted_path: this.extracted_path,
            file_count: this.file_count,
            size: {
                compressed: this.compressed_size,
                decompressed: this.decompressed_size
            }
        };
        let data = JSON.stringify(jdata);

        fs.writeFileSync(workspace_path, data);
    }

    /**
     * Function Name: load()
     * 
     * @param path (String) Path to a .json file
     * 
     * Summary: Loads a .json file storing ExtractionInfo data into a new instance of ExtractionInfo. Returns -1 if the
     * path doesn't exist, 0 if it passes. 
     * 
     */
    public load(path: string): number{
        if(!fs.existsSync(path)){
            //Doesn't exist
            return -1;
        }

        let rawdata = fs.readFileSync(path);
        let data = JSON.parse(rawdata.toString());

        this.compressed_path = data.compressed_path;
        this.extracted_path = data.extracted_path;
        this.file_count = data.file_count;
        this.compressed_size = data.size.compressed;
        this.decompressed_size = data.size.decompressed;
        return 0;
    }

}
