import * as vscode from 'vscode'
import { readdirSync, existsSync, fstat, readFileSync } from 'fs'
import { resolve, dirname } from 'path'

// 判断当前行是否是配置行
const getAliasConfig = (webpackAlias: any, lineText: string) => {
  if (webpackAlias) {
    let alias: string =
      Object.keys(webpackAlias).find(x => {
        return lineText.indexOf(`"${x}`) >= 0 || lineText.indexOf(`'${x}`) >= 0
      }) || ''
    if (alias) {
      return {
        alias: alias,
        path: webpackAlias[alias]
      }
    } else {
      return null
    }
  } else {
    return null
  }
}

// 路径是/线的时候读取子文件
const provideCompletionItems = (
  document: vscode.TextDocument,
  position: vscode.Position
) => {
  try {
    const line = document.lineAt(position)
    const lineText: string = line.text.substring(0, position.character)
    let rootPath: string =
      vscode && vscode.workspace && vscode.workspace.rootPath
        ? vscode.workspace.rootPath.toString()
        : ''
    const packageInfo = require(`${rootPath}/package.json`)
    const alisConfig = getAliasConfig(packageInfo.webpackAlias, lineText)
    if (alisConfig) {
      let path: string = lineText.substring(
        lineText.indexOf(alisConfig.alias) + alisConfig.alias.length
      )
      let dirPath = resolve(rootPath, `./${alisConfig.path}`, `./${path}`)
      let files: string[] = []
      if (existsSync(dirPath)) {
        files = readdirSync(dirPath)
      }
      return files.map(item => {
        return new vscode.CompletionItem(item, vscode.CompletionItemKind.Field)
      })
    } else {
      return null
    }
  } catch (e) {
    vscode.window.showInformationMessage(e.message)
  }
}

const provideHover = (
  document: vscode.TextDocument,
  position: vscode.Position,
  token: vscode.CancellationToken
) => {
  const line = document.lineAt(position).text.replace(/\"/g, "'")
  if (line.includes('import') && line.includes('from')) {
    let importPath = line
      .split(' from ')[1]
      .trim()
      .replace(/\'/g, '')
    let rootPath: string =
      vscode && vscode.workspace && vscode.workspace.rootPath
        ? vscode.workspace.rootPath.toString()
        : ''
    const packageInfo = require(`${rootPath}/package.json`)
    if (packageInfo.webpackAlias) {
      const alias: string =
        Object.keys(packageInfo.webpackAlias).find(key =>
          importPath.startsWith(key)
        ) || ''
      if (alias) {
        let realPath = importPath.replace(
          alias,
          packageInfo.webpackAlias[alias]
        )
        try {
          let fullPath = `${rootPath}/${realPath}`.replace(/\\/g, '/')
          if (!fullPath.endsWith('.js') && !fullPath.endsWith('.vue')) {
            if (existsSync(`${fullPath}.js`)) {
              fullPath += '.js'
            } else if (existsSync(`${fullPath}.vue`)) {
              fullPath += '.vue'
            } else if (existsSync(`${fullPath}/index.js`)) {
              fullPath += '/index.js'
            } else if (existsSync(`${fullPath}/index.vue`)) {
              fullPath += '/index.vue'
            }
            const importText = readFileSync(fullPath, 'UTF-8').split('\r\n')
            if (importText) {
              return new vscode.Hover(importText)
            }
          }
        } catch (e) {
          vscode.window.showInformationMessage(e.message)
        }
      }
    }
    return null
  }
  return null
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "alias-import" is now active!')

  const resolveCompletionItem = () => {
    return null
  }
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      '*',
      {
        provideCompletionItems,
        resolveCompletionItem
      },
      '/'
    )
  )
  context.subscriptions.push(
    vscode.languages.registerHoverProvider('*', {
      provideHover
    })
  )
}

export function deactivate() {}
