// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { Deploy } from './business'
import { StatusBarAlignment } from 'vscode'
import { existsSync } from 'fs'
const cmd = require('node-cmd')

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "ssh-deploy" is now active!')
  let rootPath: string =
    vscode && vscode.workspace && vscode.workspace.rootPath
      ? vscode.workspace.rootPath.toString()
      : ''
  let configPath = `${rootPath}/ssh-deploy.conf.json`
  if (existsSync(configPath)) {
    let config: any = require(configPath)
    // 设置绝对路径
    Object.keys(config).forEach(key => {
      config[key].localPath = `${rootPath}/${config[key].localPath}`
    })
    let barItem = vscode.window.createStatusBarItem(
      StatusBarAlignment.Left,
      200
    )
    barItem.text = 'SSH上传'
    barItem.tooltip = '上传文件到置顶服务器'
    barItem.show()
    barItem.command = 'extension.sshDeploy'
    let sshDeployCommpand = vscode.commands.registerCommand(
      'extension.sshDeploy',
      function() {
        vscode.window
          .showInformationMessage(
            '请选择你要发布的环境',
            ...Object.keys(config)
          )
          .then((select: any) => {
            let curConfig: IDeployConfig = config[select]
            if (curConfig) {
              if (curConfig.beforeUploadCmd) {
                console.log(`正在执行命令${curConfig.beforeUploadCmd}`)
                cmd.get(curConfig.beforeUploadCmd, (err: any, data: any) => {
                  if (!err) {
                    console.log(`命令执行完毕`)
                    Deploy(curConfig)
                  } else {
                    vscode.window.showErrorMessage('beforeUploadCmd错误')
                    console.log(err)
                  }
                })
              } else {
                Deploy(curConfig)
              }
            }
          })
      }
    )
    context.subscriptions.push(sshDeployCommpand)
  }
}

export function deactivate() {}
