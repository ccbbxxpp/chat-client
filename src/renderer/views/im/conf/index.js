export default {
  app_name: 'V-IM',
  http_protocol: 'http',
  http_port: 9999,
  ws_port: 9326,
  init: '/api/user/init',
  his_url: '/api/message/list',
  chat_users_url: '/api/user/chatUserList',
  token_path: '/oauth/token',
  register_url: '/register',
  ws_protocol: 'ws',
  upload_url: '/api/upload',
  updateClient_url: '/user/update-exe',//更新客户端
  version: '1.0',//版本号
  loginUrl: '/oauth/login',//用户登录
  userInfoUrl: '/wfuser/getUserInit',//初始化用户信息
  updateFriendNameUrl: '/wfuser/updateFriendName',//修改好友备注
  updatePwdUrl: '/updatePwd',//修改密码
  updateDisplayNameUrl: '/wfuser/updateDisplayName',//修改用户昵称

  getHostUrl: function() {
    let host = localStorage.getItem('host');
    if (host == '' || host == null) {
      host = '127.0.0.1';
    }
    return this.http_protocol + '://' + host + ':' + this.http_port;
  }
  ,
  getWsUrl: function() {
    let host = localStorage.getItem('host');
    if (host == '' || host == null) {
      host = '127.0.0.1';
    }
    return this.ws_protocol + '://' + host + ':' + this.ws_port;
  }
  ,
  // 修改用户密码
  getUpdatePwdUrl() {
    let host = localStorage.getItem('host');
    if (host == '' || host == null) {
      host = '127.0.0.1';
    }
    return this.http_protocol + '://' + host + ':' + '8888' + this.updatePwdUrl;
  },
  getTokenUrl: function() {
    return this.getHostUrl() + this.token_path;
  }
  ,
  getInitUrl: function() {
    return this.getHostUrl() + this.init;
  }
  ,
  getHisUrl: function() {
    return this.getHostUrl() + this.his_url;
  }
  ,
  getRegisterUrl: function() {
    return this.getHostUrl() + this.register_url;
  }
  ,
  getUploadUrl: function() {
    return this.getHostUrl() + this.upload_url;
  }
  ,
  getUpdClientUrl: function() {
    return this.getHostUrl() + this.updateClient_url;
  },
  getVersion: function() {
    return this.version;
  },

  // 用户登录
  getLoginUrl: function() {
    return this.getHostUrl() + this.loginUrl;
  },
  // 初始化用户信息
  getUserInfoUrl: function() {
    return this.getHostUrl() + this.userInfoUrl;
  },
  // 修改好友备注
  getUpdateFriendNameUrl: function() {
    return this.getHostUrl() + this.updateFriendNameUrl;
  },
  //修改用户昵称
  getUpdateDisplayNameUrl: function() {
    return this.getHostUrl() + this.updateDisplayNameUrl;
  }

}
;
