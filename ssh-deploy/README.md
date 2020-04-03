# ssh-deploy README
### 支持配置多环境
`
{
  "dev": { // 环境
    "account": {  // 登录服务器的账号
      "host": "",
      "port": "",
      "username": "",
      "password": ""
    },
    "beforeUploadCmd": "",
    "localPath": "dist/",  // 本地代码相对地址,前面不要打/杠
    "remotePath": "/etc/nginx/xxxx/"  // 服务器地址
  },
  "test": {
    "account": {
      "host": "",
      "port": "",
      "username": "",
      "password": ""
    },
    "beforeUploadCmd": "",
    "localPath": "",
    "remotePath": ""
  }
}

`
