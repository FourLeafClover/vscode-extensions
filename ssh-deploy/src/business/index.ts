let Client = require('ssh2-sftp-client')
import * as vscode from 'vscode'
export const Deploy = async (config: IDeployConfig) => {
  let sftp = new Client()
  sftp
    .connect(config.account)
    .then(async (data: any) => {
      const isExists = await sftp.exists(config.remotePath)
      if (isExists) {
        return sftp.rmdir(config.remotePath, true)
      } else {
        return sftp.mkdir(config.remotePath)
      }
    })
    .then(() => {
      console.log('服务器连接成功,服务器代码文件删除完毕')
      console.log('正在上传包到服务器')
      return sftp.uploadDir(config.localPath, config.remotePath)
    })
    .then((data: any) => {
      // console.log(localPath + "上传完成");
      console.log('文件上传完毕')
      vscode.window.showInformationMessage(`发布到${config.account.host}成功!`)
      sftp.end()
    })
    .catch((err: any) => {
      console.log(err)
      vscode.window.showErrorMessage(err)
    })
}
