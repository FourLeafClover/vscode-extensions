import * as vscode from 'vscode';
import { readdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const getAliasConfig = (webpackAlias: any, lineText: string) => {
	if (webpackAlias) {
		let alias: string = Object.keys(webpackAlias).find(x => {
			return lineText.indexOf(`"${x}`) >= 0 || lineText.indexOf(`'${x}`) >= 0;
		}) || '';
		if (alias) {
			return {
				alias: alias,
				path: webpackAlias[alias]
			};
		} else {
			return null;
		}
	} else {
		return null;
	}
};

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "alias-import" is now active!');
	const provideCompletionItems = (document: { lineAt: (arg0: any) => any; }, position: { character: any; }) => {
		try {
			const line = document.lineAt(position);
			const lineText: string = line.text.substring(0, position.character);
			let rootPath: string = vscode && vscode.workspace && vscode.workspace.rootPath ? vscode.workspace.rootPath.toString() : '';
			const packageInfo = require(`${rootPath}/package.json`);
			const alisConfig = getAliasConfig(packageInfo.webpackAlias, lineText);
			if (alisConfig) {
				let path: string = lineText.substring(lineText.indexOf(alisConfig.alias) + alisConfig.alias.length);
				let dirPath = resolve(rootPath, `./${alisConfig.path}`,`./${path}`);
				let files:string[] = []; 
				if (existsSync(dirPath)) {
					files = readdirSync(dirPath);
				}
				return files.map(item => {
					return new vscode.CompletionItem(item, vscode.CompletionItemKind.Field);
				});
			} else {
				return null;
			}	
		} catch (e) {
			vscode.window.showInformationMessage(e.message);
		}
	};
	const resolveCompletionItem = () => {
		return null;
	};
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('*', {
		provideCompletionItems,
		resolveCompletionItem
	}, '/'));
}

export function deactivate() {}