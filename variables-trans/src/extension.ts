// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-english" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerTextEditorCommand('extension.variables-trans', (e) => {
		// The code you place here will be executed every time your command is executed		
		// Display a message box to the user
		const activeText = e.document.getText(e.selection);
		axios.get(`http://translate.google.cn/translate_a/single?client=gtx&dt=t&dj=1&ie=UTF-8&sl=auto&tl=en&q=${encodeURI(activeText)}`).then(transRes => {
			if (transRes.data.sentences && transRes.data.sentences.length > 0) {
				let transText: string = transRes.data.sentences[0].trans;
			  transText =	transText.split(' ').filter(x => x).map((item, index) => {
					if (index === 0) {
						return item.toLocaleLowerCase();
					} else {
						return item.substring(0, 1).toUpperCase() + item.substring(1).toLocaleLowerCase();
					}
				}).join('');
				e.edit(async editBuilder => {
					editBuilder.replace(new vscode.Range(new vscode.Position(e.selection.start.line, e.selection.start.character), new vscode.Position(e.selection.end.line, e.selection.end.character)), transText);
				});
			}
		}).catch(e => {
			vscode.window.showInformationMessage(e.message);
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
