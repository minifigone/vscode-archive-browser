// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { extract_file_at_path } from './file_types';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Archive Browser activated.');

	// Command that will run when extracting files from the context menu
	// Command defined in package.json
	let place = vscode.commands.registerCommand('archive-browser.menuExtract', (uri:vscode.Uri) => {
		// Saves the file path of the file
		let path = uri.fsPath;

		//Displays message to user with file path
		let msg: string = `Archive Browser Extracting From: ` + path;
		vscode.window.showInformationMessage(msg);

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

			// Display a message box to the user
			let msg: string = "Archive Browser Extract called with parameter: " + path;
			vscode.window.showInformationMessage(msg);
			extract_file_at_path(path);
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
