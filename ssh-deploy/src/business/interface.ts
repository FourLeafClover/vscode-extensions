interface IAccount {
  host: string;
  port: string;
  username: string;
  password: string;
}

interface IDeployConfig {
  account: IAccount;
  localPath: string;
  remotePath: string;
  beforeUploadCmd: string;
}