"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs_1 = require("fs");
const path_1 = require("path");
// 判断当前行是否是配置行
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
// 路径是/线的时候读取子文件
const provideCompletionItems = (document, position) => {
    try {
        const line = document.lineAt(position);
        const lineText = line.text.substring(0, position.character);
        let rootPath = vscode && vscode.workspace && vscode.workspace.rootPath
            ? vscode.workspace.rootPath.toString()
            : '';
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
const provideHover = (document, position, token) => {
    const line = document.lineAt(position).text.replace(/\"/g, "'");
    if (line.includes('import') && line.includes('from')) {
        let importPath = line
            .split(' from ')[1]
            .trim()
            .replace(/\'/g, '');
        let rootPath = vscode && vscode.workspace && vscode.workspace.rootPath
            ? vscode.workspace.rootPath.toString()
            : '';
        const packageInfo = require(`${rootPath}/package.json`);
        if (packageInfo.webpackAlias) {
            const alias = Object.keys(packageInfo.webpackAlias).find(key => importPath.startsWith(key)) || '';
            if (alias) {
                let realPath = importPath.replace(alias, packageInfo.webpackAlias[alias]);
                try {
                    let fullPath = `${rootPath}/${realPath}`.replace(/\\/g, '/');
                    if (!fullPath.endsWith('.js') && !fullPath.endsWith('.vue')) {
                        if (fs_1.existsSync(`${fullPath}.js`)) {
                            fullPath += '.js';
                        }
                        else if (fs_1.existsSync(`${fullPath}.vue`)) {
                            fullPath += '.vue';
                        }
                        else if (fs_1.existsSync(`${fullPath}/index.js`)) {
                            fullPath += '/index.js';
                        }
                        else if (fs_1.existsSync(`${fullPath}/index.vue`)) {
                            fullPath += '/index.vue';
                        }
                        const importText = fs_1.readFileSync(fullPath, 'UTF-8').split('\r\n');
                        if (importText) {
                            return new vscode.Hover(importText);
                        }
                    }
                }
                catch (e) {
                    vscode.window.showInformationMessage(e.message);
                }
            }
        }
        return null;
    }
    return null;
};
function activate(context) {
    console.log('Congratulations, your extension "alias-import" is now active!');
    const resolveCompletionItem = () => {
        return null;
    };
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('*', {
        provideCompletionItems,
        resolveCompletionItem
    }, '/'));
    context.subscriptions.push(vscode.languages.registerHoverProvider('*', {
        provideHover
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map