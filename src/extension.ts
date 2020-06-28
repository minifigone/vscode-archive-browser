// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { extract_file_at_path } from './file_types';
import {Category,CategoryLogger,CategoryServiceFactory,CategoryConfiguration,LogLevel} from "typescript-logging";
import {ExtractionInfo} from './file_info';

//changes the default output to INFO instead of ERR
CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Info));

//creates a categories for logging things that have to do with extractions, decompressions, and the temp directory
export const extract = new Category("File Extract"); 
export const decomp = new Category("File Decompression");
export const dir = new Category("Temp Directory");


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	//line saying extension is activated
	extract.info("GO GO EXTENSION");

	// Command that controls the unextracted info webview
	// for now it only shows the file size and a button to extract
	// Command defined in package.json
	let info = vscode.commands.registerCommand('archive-browser.getInfo', (uri:vscode.Uri) => {
		// Saves the file path of the file
		let path = uri.fsPath;
		let file_info = new ExtractionInfo(path);
		
		//creates webview panel
		const panel = vscode.window.createWebviewPanel('Info', path, vscode.ViewColumn.One,  {enableScripts: true});

		panel.webview.html = getWebviewContent(file_info.compressedSize);

		//waits for a message from the HTML to extract the files
		panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
				case 'extract':
					logExtract(path);
					extract_file_at_path(path);
					return;
				}
			  }
			);

	});

	// Command that will run when extracting files from the context menu
	// Command defined in package.json
	let place = vscode.commands.registerCommand('archive-browser.menuExtract', (uri:vscode.Uri) => {
		// Saves the file path of the file
		let path = uri.fsPath;
		
		//calls function to log the extraction with the file path.
		logExtract(path);

		//Displays message to user with file path
		let msg: string = `Archive Browser Extracting From: ` + path;
		vscode.window.showInformationMessage(msg);
		extract_file_at_path(path);
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('archive-browser.extract', () => {
		// The code you place here will be executed every time your command is executed
		let prompt_config: vscode.InputBoxOptions = { // Struct for managing input box.
			prompt: "Enter a path to an archive file for extraction."
		};
		vscode.window.showInputBox(prompt_config).then(path => {
			if (!path) { // No input; get out
				return;
			}
			
			//calls function to log the extraction with the file path.
			logExtract(path);

			// Display a message box to the user
			let msg: string = "Archive Browser Extract called with parameter: " + path;
			vscode.window.showInformationMessage(msg);
			extract_file_at_path(path);
		});
	});

	context.subscriptions.push(disposable);
}

//functions that can be imported for mass uses in calls to log info
export function logExtract(path: string) {
	extract.info("Attempting to extract files from: " + path);
}

//Webview controller. Creates the new webview pane.
//If the the "Extract File" button is pressed, it sends a message back to info
// to extract the file's contents. 
function getWebviewContent(size: number) {
	const tmp =  
	`<html> 
	<html lang="en">
		<head> 
			<title>Archive Information</title> 
		</head> 
		<body> 
			<div style="font-size:30px">File size: ${size} bytes</div> 
			<h3><h3>
			<button onclick="extract()">Extract Files</button>
			<script>
				function extract(){
					const vscode = acquireVsCodeApi();
					vscode.postMessage({command: 'extract'})
				}
			</script>
		</body> 
	</html> `;

	return tmp;
  }

// this method is called when your extension is deactivated
export function deactivate() {}
