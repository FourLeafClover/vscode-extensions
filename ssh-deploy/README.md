# 欢迎使用 SSH上传工具

	1.主要用户前端项目发版，上传文件到服务器
	2.支持多环境,需要环境请在json配置文件里面新增对象的key
	3.配置文件ssh-deploy.conf.json请添加到项目根目录下,此文件应该在git中忽略

```
{
  "dev": { // 环境
    "account": {  // 登录服务器的账号
      "host": "",
      "port": "",
      "username": "",
      "password": ""
    },
    "beforeUploadCmd": "", // 上传文件之前需要执行的cmd命令,一般放编译打包命令
    "localPath": "dist/",  // 本地代码相对地址,前面不要打/杠,后面请带上/杠
    "remotePath": "/etc/nginx/xxxx/"  // 服务器绝对地址,前后请带上/杠
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

```