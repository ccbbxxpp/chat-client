<template>
    <div class="login">
        <Top></Top>
        <div class="login-panel" style="-webkit-app-region: no-drag">
            <div class="title">登录</div>
            <Alert v-if="showErr" type="error">{{err}}</Alert>
            <div class="item">
                <label>账号：</label>
                <Input prefix="ios-contact-outline" v-model="username" placeholder="账号" class="item-input"/>
            </div>
            <div class="item">
                <label>密码：</label>
                <Input prefix="ios-lock-outline" type="password" v-model="password" placeholder="密码"
                       class="item-input"/>
            </div>
            <div class="btn item">
                <Button type="success" @click="login()">登录</Button>
            </div>
            <!-- <div class="item register">
                 <a type="info" class="pull-right" @click="showRegister = true" style="color: green">注册</a>
             </div>-->
        </div>
        <Modal closable class="user-model" v-model="showSetting"
               footer-hide title="设置" width="300">
            <Input v-model="host" class="setting-item" placeholder="主机地址"/>
            <Button type="primary" ghost long @click="saveSetting" style="margin: 1rem 0">保存</Button>
        </Modal>
        <Modal closable class="user-model" v-model="showRegister"
               footer-hide title="注册新用户" width="300">
            <Input v-model="registerUsername" class="setting-item" placeholder="昵称"/>
            <Input v-model="registerLoginName" class="setting-item" placeholder="登录账号"/>
            <Input v-model="registerPassword" type="password" class="setting-item" placeholder="密码"/>
            <Input v-model="registerPassword2" type="password" class="setting-item" placeholder="确认密码"/>
            <Button type="primary" ghost long @click="saveRegister" style="margin: 1rem 0">保存</Button>
        </Modal>
        <!--<Icon type="ios-settings-outline" class="setting" @click="showSetting = true"/>-->
        <vue-particles color="#dedede" :particlesNumber="50" class="bg-login"></vue-particles>
    </div>
</template>

<script>
  import Top from './im/components/top.vue';
  import conf from './im/conf';
  import { timeoutFetch, fetchPost, tokenFetch, flushToken, ErrorType, logout } from './im/utils/chatUtils';
  import HttpApiUtils from './im/utils/HttpApiUtils';
  import HttpUtils from './im/utils/HttpUtils';
  import cookieUtil from './im/utils/cookieUtil';
  import batUse from './im/utils/batUse';
  import aesUtil from './im/utils/aesUtil';

  export default {
    name: 'login',
    data() {
      return {
        app_name: conf.app_name,
        username: '',
        password: '',
        registerLoginName: '',
        registerUsername: '',
        registerPassword: '',
        registerPassword2: '',//确认密码
        err: '',
        showErr: false,
        showSetting: false,
        showRegister: false,
        host: '47.244.202.162'//todo
      };
    },
    components: {
      Top
    },
    methods: {
      saveSetting() {
        let self = this;
        localStorage.setItem('host', self.host);
        self.$Message.success('保存成功！');
        self.showSetting = false;
      },
      clickUser() {
        location.reload();
      },
      saveRegister: function() {
        let self = this;
        if (self.registerUsername.length < 2 || self.registerUsername.length > 8) {
          self.$Message.error('昵称为2-8个字符！');
          return;
        } else if (self.registerLoginName == '' || self.registerLoginName == null) {
          self.$Message.error('登录账号不能为空！');
          return;
        } else if (!/^[A-Za-z0-9]+$/.test(self.registerLoginName)) {
          self.$Message.error('登录账号为数字或英文字母！');
          return;
        } else if (self.registerPassword == '' || self.registerPassword == null) {
          self.$Message.error('密码不能为空！');
          return;
        } else if (self.registerPassword !== self.registerPassword2) {
          self.$Message.error('两次密码输入不一致！');
          return;
        }
        let formData = new FormData();
        // 请求参数 ('key',value)
        formData.set('loginName', self.registerLoginName);
        formData.set('name', self.registerUsername);
        formData.set('password', self.registerPassword);
        fetch(conf.getRegisterUrl(), {
          method: 'POST',
          model: 'cros', //跨域
          headers: {
            Accept: 'application/json'
          },
          body: formData
        })
          .then(response => response.json())
          .then(json => {
            if ('0' === json.resultCode) {
              self.$Message.success('注册成功');
              self.showRegister = false;
            } else {
              self.$Message.error(json.message);
            }
          })
          .catch(() => {
            self.$Message.error('服务器未响应');
          });
      },
      /**
       * 从远程服务中获取登录用户的信息
       */

      login: function() {
        // todo
        let self = this;
        let httpUtils = new HttpUtils();

        let username = self.username;
        let password = self.password;
        let clientId = '1539698981861';
        httpUtils.login(username, password, clientId, function(json, token) {
          if (json && token) {
            // 登录成功 保存登录用户名和密码
            cookieUtil.setCookies(self.username, self.password);
            self.$store.commit('setToken', token);
            self.$store.commit('setTokenStatus', true);
            sessionStorage.setItem('token', token);
            //个人信息
            self.$store.commit('setUser', json.me);
            //好友
            self.$store.commit('setUserFriendList', json.friends);
            //群
            self.$store.commit('setChatGroupList', json.groups);
            // 路由到主页面
            self.$router.push({
              path: '/index/chatBox',
              params: {}
            });
          } else if (json == 'error') {
            self.$Message.warning('用户名或密码错误');
          } else if (json == 'no server response') {
            self.$Message.warning('服务器未响应');
          }

        });

        // todo


        /*let self = this;
        let param = new FormData();
        param.set('client_id', 'v-client');
        param.set('client_secret', 'v-client-ppp');
        param.set('grant_type', 'password');
        param.set('scope', 'select');
        param.set('username', self.username);
        param.set('password', self.password);
        cookieUtil.setCookies(self.username, self.password);
        let hp = new HttpApiUtils();
        hp.login(param)
        //存储 token
          .then(token => {
            self.$store.commit('setToken', token);
            self.$store.commit('setTokenStatus', true);
            //刷新token 定时器
            let flushTimeout = (token.expires_in - 10) * 1000;
            let api = new HttpApiUtils();
            //刷新时间短
            if (flushTimeout < 10000) {
              api.flushToken(self);
            } else {
              let flushTokenTimerId = setTimeout(function() {
                api.flushToken(self);
              }, flushTimeout);
              self.$store.commit('setFlushTokenTimerId', flushTokenTimerId);
            }
            //初始化用户数据
            return hp.initInfo();
          })
          //存储用户数据
          .then(response => {
            if (response.status === 200) {
              return response.json();
            } else if (response.status === 401) {
              return new Promise((resolve, reject) => {
                reject(ErrorType.TOKEN_ERROR);
              });
            } else {
              return new Promise((resolve, reject) => {
                reject(ErrorType.SERVER_ERROR);
              });
            }
          })
          //存储用户数据
          .then(json => {
            //个人信息
            self.$store.commit('setUser', json.me);
            //好友
            self.$store.commit('setUserFriendList', json.friends);
            //群
            self.$store.commit('setChatGroupList', json.groups);
            // 跳转到index 页面
            self.$router.push({
              path: '/index/chatBox',
              params: {}
            });
          })
          .catch(error => {
            console.log(error);
            if ('TypeError: Failed to fetch' === error.toString()) {
              self.$Message.warning('服务器未响应');
            } else if (ErrorType.TOKEN_ERROR === error || ErrorType.PARAM_ERROR === error || ErrorType.SERVER_ERROR === error) {
              self.$Message.warning('用户名或密码不对');
            } else {
              self.$Message.warning(error.toString());
            }
          });*/
      }

    },
    created: function() {
      //初始化信息時拿到上次登陸的用戶名和密碼
      this.username = cookieUtil.getCookies('username');
      this.password = cookieUtil.getCookies('password');
    }
  };
</script>

<style lang="scss" scoped>
    @import './../styles/theme.scss';

    .login {
        height: 100%;
        background: url('../assets/bg3.jpg') no-repeat;
        background-size: 100% 100%;
        position: relative;

        .bg-login {
            height: 100%;
            position: absolute;
            top: 0;
            width: 100%;
            z-index: 1;
        }

        .login-panel {
            width: 33rem;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 2rem 3rem 5rem 3rem;
            position: absolute;
            right: 8rem;
            top: 15rem;
            z-index: 2;

            .item {
                margin-top: 2rem;

                label {
                    width: 5rem;
                    text-align: right;
                    display: inline-block;
                }

                .item-input {
                    width: auto !important;
                }
            }

            .btn {
                text-align: center;

                button {
                    width: 86%;
                }
            }

            .title {
                color: $color-default;
                font-size: 20px;
                font-weight: bold;
                text-align: center;
            }
        }

        .setting {
            color: #fff;
            font-size: 2rem;
            display: block;
            right: 1rem;
            position: absolute;
            bottom: 1rem;
            cursor: pointer;
            z-index: 3;
        }

        .save-setting-btn {
            margin: 1rem 0 !important;
        }

        .register {
            padding: 0 2.2rem;
        }
    }

    .setting-item {
        margin-bottom: 1rem;

        .ivu-input {
            border: 1px solid #84eeba !important;
            background-color: #2baee9;
        }
    }
</style>
