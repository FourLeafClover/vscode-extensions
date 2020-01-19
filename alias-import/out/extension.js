"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs_1 = require("fs");
const path_1 = require("path");
const getAliasConfig = (webpackAlias, lineText) => {
    if (webpackAlias) {
        let alias = Object.keys(webpackAlias).find(x => {
            return lineText.indexOf(`"${x}`) >= 0 || lineText.indexOf(`'${x}`) >= 0;
        }) || '';
        if (alias) {
            return {
                alias: alias,
                path: webpackAlias[alias]
            };
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
};
function activate(context) {
    console.log('Congratulations, your extension "alias-import" is now active!');
    const provideCompletionItems = (document, position) => {
        try {
            const line = document.lineAt(position);
            const lineText = line.text.substring(0, position.character);
            let rootPath = vscode && vscode.workspace && vscode.workspace.rootPath ? vscode.workspace.rootPath.toString() : '';
            const packageInfo = require(`${rootPath}/package.json`);
            const alisConfig = getAliasConfig(packageInfo.webpackAlias, lineText);
            if (alisConfig) {
                let path = lineText.substring(lineText.indexOf(alisConfig.alias) + alisConfig.alias.length);
                let dirPath = path_1.resolve(rootPath, `./${alisConfig.path}`, `./${path}`);
                let files = [];
                if (fs_1.existsSync(dirPath)) {
                    files = fs_1.readdirSync(dirPath);
                }
                return files.map(item => {
                    return new vscode.CompletionItem(item, vscode.CompletionItemKind.Field);
                });
            }
            else {
                return null;
            }
        }
        catch (e) {
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
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map