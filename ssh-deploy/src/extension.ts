// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { Deploy } from './business'
import { StatusBarAlignment } from 'vscode'
import { existsSync, writeFileSync, copyFileSync, readFileSync } from 'fs'
import defaultConf from './business/default.conf'
import { dirname } from 'path'
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
  // 设置绝对路径
  let barItem = vscode.window.createStatusBarItem(StatusBarAlignment.Left, 200)
  barItem.text = 'SSH上传'
  barItem.tooltip = '上传文件到置顶服务器'
  barItem.show()
  barItem.command = 'extension.sshDeploy'
  let sshDeployCommpand = vscode.commands.registerCommand(
    'extension.sshDeploy',
    function() {
      const ADDRCONFIG = '+ 创建SSH上传配置'
      const selectKeys: Array<string> = [ADDRCONFIG]
      let config: any = null
      if (existsSync(configPath)) {
        try {
          config = require(configPath)
          Object.keys(config).forEach(key => {
            config[key].localPath = `${rootPath}/${config[key].localPath}`
          })
          selectKeys.push(...Object.keys(config))
        } catch (e) {
          vscode.window.showErrorMessage('配置文件读取失败,不是标准的Json文件') 
        }
      }
      vscode.window
        .showQuickPick(selectKeys, {
          canPickMany: false,
          ignoreFocusOut: true,
          matchOnDescription: true,
          matchOnDetail: true,
          placeHolder: '请选择你要部署的环境/添加对应配置'
        })
        .then((select: any) => {
          if (select === ADDRCONFIG) {
            try {
              writeFileSync(configPath, defaultConf)
              vscode.window.showInformationMessage('配置文件ssh-deploy.conf.json创建成功')
            } catch (e) {
              vscode.window.showErrorMessage(e)
            }
          } else {
            let curConfig = config[select]
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
          }
        })
    }
  )
  context.subscriptions.push(sshDeployCommpand)
}

export function deactivate() {}
