import conf from '../conf';

class HttpUtils {
  constructor() {
  }

  /**
   * 用户登录 初始化用户信息
   * @param username 用户名
   * @param password 密码
   * @param clientId 客户端Id
   * @param callback 回调函数
   */
  login(username, password, clientId, callback) {
    let paramData = new FormData();
    paramData.set('username', username);
    paramData.set('password', password);
    paramData.set('clientId', clientId);
    let loginUrl = conf.getLoginUrl();
    let getUserInfoUrl = conf.getUserInfoUrl();
    // 账户密码登录 校验用户个人信息 验证通过返回用户id
    fetch(loginUrl, {
      method: 'POST',
      model: 'cros', //跨域
      headers: {
        Accept: 'application/json'
      },
      body: paramData
    }).then(response => {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 401) {
        return callback('error');
      }
    }).then(json => {
      if (json) {
        let code = json.code;
        let message = json.message;
        if (code === 0 && message === 'success') {
          // 密码验证通过 登录成功
          let result = json.result;
          let userId = result.userId;
          let token = result.token;
          let register = result.register;
          let getUserInfoParam = JSON.stringify({
            'userId': userId
          });
          //获取用户相关基础信息：个人信息，好友信息，群组信息
          fetch(getUserInfoUrl, {
            method: 'POST',
            model: 'cros', //跨域
            headers: {
              'Content-Type': 'application/json'
            },
            body: getUserInfoParam
          }).then(response => {
            if (response.status === 200) {
              return response.json();
            }
          }).then(json => {
            // 返回用户相关信息
            callback(json, token);
          });
        } else {
          // 密码错误
          callback('error');
        }
      }
    })
      .catch(e => {
        callback('no server response');
      });
  }

  /**
   * 修改好友备注
   * @param uid 用户Id
   * @param fid 好友Id
   * @param alias 好友备注名
   * @param callback 回调函数
   */
  updateFriendName(uid, fid, alias, callback) {
    let url = conf.getUpdateFriendNameUrl();
    let param = JSON.stringify({
      'uid': uid,
      'fid': fid,
      'alias': alias
    });
    fetch(url, {
      method: 'POST',
      model: 'cros', //跨域
      headers: {
        'Content-Type': 'application/json'
      },
      body: param
    }).then(response => {
      // 请求成功 修改成功
      if (response.status === 200) {
        // 重新获取用户好友信息数据
        this.getUserInit(uid, function(json) {
          callback('200', json);
        });
      }
    }).catch(e => {
      //修改异常
      callback('111');
    });

  }


  /**
   * 初始化用户信息
   * @param userId
   */
  getUserInit(userId, callback) {
    let url = conf.getUserInfoUrl();
    let getUserInfoParam = JSON.stringify({
      'userId': userId
    });
    //获取用户相关基础信息：个人信息，好友信息，群组信息
    fetch(url, {
      method: 'POST',
      model: 'cros', //跨域
      headers: {
        'Content-Type': 'application/json'
      },
      body: getUserInfoParam
    }).then(response => {
      if (response.status === 200) {
        return response.json();
      }
    }).then(json => {
      // 返回用户相关信息
      callback(json);
    });
  }

  /**
   *  修改密码
   * @param uid       用户Id
   * @param oldPwd    旧密码
   * @param newPwd    新密码
   * @param callback  http请求结束后的回调函数
   */
  updatePwd(uid, oldPwd, newPwd, callback) {
    let url = conf.getUpdatePwdUrl();
    let param = JSON.stringify({
      'userId': uid,
      'oldPassword': oldPwd,
      'password': newPwd
    });
    fetch(url, {
      method: 'POST',
      model: 'cros', //跨域
      headers: {
        'Content-Type': 'application/json'
      },
      body: param
    }).then(response => {
      if (response.status === 200) {
        return response.json();
      }
    }).then(json => {
      callback(200, json);
    }).catch(e => {
      callback(111);
    });
  }

  /**
   *  修改用户昵称
   * @param uid           用户Id
   * @param displayName   昵称
   * @param callback      回调函数
   */
  updateDispalyName(uid, displayName, callback) {
    let url = conf.getUpdateDisplayNameUrl();
    let param = JSON.stringify({
      'uid': uid,
      'displayName': displayName
    });
    fetch(url, {
      method: 'POST',
      model: 'cros', //跨域
      headers: {
        'Content-Type': 'application/json'
      },
      body: param
    }).then(response => {
      if (response.status === 200) {
        callback(200);
      }
    }).catch(e => {
      callback(111);
    });
  }

  /**
   * 设置好友关系
   * @param userId      用户ID
   * @param friendUid   好友ID
   * @param status      好友关系 0:好友 1:陌生人 2:拉黑
   * @param callback
   */
  setFriendsStatus(userId, friendUid, status, callback) {
    let url = 'http://127.0.0.1:18080/admin/friend/status';
    let param = JSON.stringify({
      'userId': userId,
      'friendUid': friendUid,
      'status': status
    });
    fetch(url, {
      method: 'POST',
      model: 'cros', //跨域
      headers: {
        'nonce': '14723',
        'timestamp': '1539698981861',
        'sign': '9e9f98672f466a81e6dd61570689528cf38e6418',
        'Content-Type': 'application/json'
      },
      body: param
    }).then(response => {
      if (response.status === 200) {
        return response.json();
      }
    }).then(json => {
      if (json.code == 0) {
        //修改成功返回200
        callback(200);
      } else {
        callback(111);
      }
    }).catch(e => {
      // 系统异常返回111
      callback(111);
    });
  }

}

export default HttpUtils;