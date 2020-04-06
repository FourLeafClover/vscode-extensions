let Client = require('ssh2-sftp-client')
import * as vscode from 'vscode'
import { readFileSync, writeFileSync, existsSync } from 'fs'
const os = require('os')

export const Deploy = async (config: IDeployConfig) => {
  try {
    let sftp = new Client()
    sftp
      .connect(config.account)
      .then(async (data: any) => {
        const message = `正在发布到${config.account.host}`
        writeLog(message)
        vscode.window.showInformationMessage(message)
        const isExists = await sftp.exists(config.remotePath)
        if (isExists) {
          return sftp.rmdir(config.remotePath, true)
        } else {
          return sftp.mkdir(config.remotePath)
        }
      })
      .then(() => {
        writeLog(`上传文件中:${config.localPath}->${config.remotePath}`)
        return sftp.uploadDir(config.localPath, config.remotePath)
      })
      .then((data: any) => {
        const message = `发布到${config.account.host}成功!`
        writeLog(message)
        writeLog('-----------结束-----------', false)
        vscode.window.showInformationMessage(message)
        sftp.end()
      })
      .catch((err: any) => {
        writeLog(err.message)
        writeLog('-----------结束-----------', false)
        vscode.window.showErrorMessage(err.message)
      })
  } catch (e) {
    writeLog(e.message)
    writeLog('-----------结束-----------', false)
    vscode.window.showErrorMessage(e.message)
  }
}

export const getBeforeUploadCommand = (rootPath: string, cmd: string) => {
  if (os.platform().includes('win')) {
    return `${rootPath.substr(0, 2)} && cd ${rootPath} && ${cmd}`
  } else {
    return `cd ${rootPath} && ${cmd}`
  }
}

export const writeLog = (message: string, showTime: boolean = true) => {
  let rootPath: string =
    vscode && vscode.workspace && vscode.workspace.rootPath
      ? vscode.workspace.rootPath.toString()
      : ''
  let data = ''
  let logPath = `${rootPath}/ssh-deploy.log.text`
  if (existsSync(logPath)) {
    data = readFileSync(`${rootPath}/ssh-deploy.log.text`, 'utf-8')
  }
  if (showTime) {
    data = `${data}\n${new Date().toLocaleString()}\n${message}`
  } else {
    data = `${data}\n${message}`
  }

  writeFileSync(logPath, data)
}
