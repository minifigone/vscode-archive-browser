import * as os from 'os';
import * as fs from 'fs';

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
        console.log('Temp dir exists.');
    }
    else{
        console.log("Temp dir doesn't exists, creating temp dir now.");
        fs.mkdir(temp_dir, { recursive: false }, (err) =>{
            if(err){
                throw err;
            }
        });
    }

    return temp_dir;
}
