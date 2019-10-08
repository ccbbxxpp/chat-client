<template>
    <div class="v-im">
        <div class="left-bar" style="-webkit-app-region: drag">
            <ul>
                <li class="userPhoto" @click="userModal = true">
                    <img :src="user.portrait" style="border-radius: 3px;"/>
                </li>
                <li>
                    <router-link v-bind:to="'/index/chatBox'">
                        <Icon type="ios-text-outline"/>
                    </router-link>
                </li>
                <li>
                    <router-link v-bind:to="'/index/userBox'">
                        <Icon type="ios-contact-outline"/>
                    </router-link>
                </li>
                <li>
                    <router-link v-bind:to="'/index/chatGroupBox'">
                        <Icon type="ios-contacts-outline"/>
                    </router-link>
                </li>
                <!--<li>
                    <router-link v-bind:to="'/index/friendsBox'">
                        <Icon type="md-add-circle"/>
                    </router-link>

                </li>-->
            </ul>
        </div>
        <keep-alive>
            <router-view class="content"/>
        </keep-alive>
        <Modal closable class="user-model" v-model="userModal"
               footer-hide :title="user.displayName" width="300">
            <div>
                <h1 align="center" style="color: darkgoldenrod ">
                    {{updateAppMsg}}
                </h1>
                <div v-if="isUpdate">
                    <h1 align="center" style="color: darkgoldenrod ">
                        检测到新版本
                    </h1>
                    <h2 align="center" style="color: darkgoldenrod;border-radius: 10px"
                        onmouseover="this.style.backgroundColor='#7D9EC0'"
                        onmouseout="this.style.backgroundColor='#FFFFFF'">
                        $$<a onmouseover="this.style.color='red'"
                             onmouseout="this.style.color='#FF6EB4'"
                             v-on:click="openImageProxy($event)">点击更新</a>$$
                    </h2>
                </div>
            </div>
            <p class="user-model-img">
                <img :src="user.portrait" class="img" style="width: 50px;height: 50px;"/>
            </p>
            <p class="user-model-item">
                <label>姓名：</label>
                <span>{{this.$store.state.user.displayName}}</span>
            </p>
            <p class="user-model-item">
                <label>账号：</label>
                <span>{{user.name}}</span>
            </p>
            <p>
                <Button style="margin-bottom: 15px" type="warning" long
                        @click="userModal=false,showUpdDisPlayNameModal = true">
                    修改昵称
                </Button>
            </p>
            <p>
                <Button style="margin-bottom: 15px" type="success" long
                        @click="userModal=false,showUpdatePwdModal=true">
                    修改密码
                </Button>
            </p>
            <p>
                <Button type="error" long @click="myLogout">退出</Button>
            </p>
        </Modal>
        <!-- 修改密码 -->
        <Modal closable class="user-model" v-model="showUpdatePwdModal"
               footer-hide title="修改密码" width="300">

            <input placeholder="请输入原密码" v-model="oldPwd" type="password"
                   style="height: 30px;width:250px;border-bottom-color: #2b85e4;border-style: none none solid none;margin-bottom: 20px">

            <input placeholder="请输入新密码,至少6个字符" v-model="newPwd" type="password"
                   style="height: 30px;width:250px;border-bottom-color: #2b85e4;border-style: none none solid none;margin-bottom: 20px">

            <input placeholder="请确认密码" v-model="confirmPwd" type="password"
                   style="height: 30px;width:250px;border-bottom-color: #2b85e4;border-style: none none solid none;margin-bottom: 20px">
            <Button long type="success" style="margin-top: 20px" @click="updatePwd">保存</Button>
        </Modal>
        <!-- 修改昵称 -->
        <Modal closable class="user-model" v-model="showUpdDisPlayNameModal"
               footer-hide title="修改昵称" width="300">
            <input :placeholder="this.$store.state.user.displayName" v-model="newDisPlayName"
                   style="height: 30px;width:250px;border-bottom-color: #2b85e4;border-style: none none solid none;margin-bottom: 20px">
            <p style="color: #c5c8ce ">
                好名字可以让朋友&nbsp;&nbsp;&nbsp;更容易记住你
            </p>
            <Button type="success" long @click="updateDisPlayName()"
                    style="margin-top: 20px">保存
            </Button>
        </Modal>
    </div>
</template>
<script>
  import { fetchPost, logout } from './im/utils/chatUtils';
  import conf from './im/conf';
  import winControl from '../../main/windowControl.js';
  import HttpUtils from './im/utils/HttpUtils';

  export default {
    data() {
      return {
        imgUrlHead: 'static',
        user: {},
        userModal: false,
        updateAppMsg: '',
        isUpdate: false,
        updateUrl: '',//更新下载地址
        showUpdatePwdModal: false,//是否展示修改密码的弹窗
        showUpdDisPlayNameModal: false,//是否展示修改昵称的弹窗
        oldPwd: '',//原密码
        newPwd: '',//新密码
        confirmPwd: '',//确认密码
        newDisPlayName: ''//新昵称
      };
    },
    methods: {
      //点击下载链接时在浏览器中打开
      openImageProxy: function(event) {
        const url = this.updateUrl;
        event.preventDefault();
        winControl.openURL(url);
      },
      // 退出登录
      myLogout: function() {
        let self = this;
        logout(self);
      },
      //修改密码
      updatePwd() {
        let self = this;
        let userId = self.user.userId;
        let oldPwd = self.oldPwd;
        let newPwd = self.newPwd;
        let confirmPwd = self.confirmPwd;
        if (newPwd.length < 6) {
          self.$Message.error('密码长度至少为6个字符！');
          return;
        } else if (!/^[A-Za-z0-9]+$/.test(newPwd)) {
          self.$Message.error('密码为数字或英文字母！');
          return;
        } else if (newPwd !== confirmPwd) {
          self.$Message.error('两次密码输入不一致！');
          return;
        }
        let http = new HttpUtils();
        // 调用修改密码的接口
        http.updatePwd(userId, oldPwd, newPwd, function(code, json) {
          if (code === 200) {
            let resultMsg = json.message;
            let resultCode = json.code;
            if (resultCode == 0) {
              self.$Message.success('修改成功，请重新登录！');
              self.myLogout();
            } else {
              self.$Message.error(resultMsg);
            }
          } else {
            self.$Message.warning('服务器未响应！');
          }

        });
      },
      //修改昵称
      updateDisPlayName() {
        let self = this;
        let uid = self.user.userId;
        let displayName = self.newDisPlayName;
        let http = new HttpUtils();
        if (displayName == '') {
          self.$Message.warning('名字不能为空哦！');
          return;
        }
        http.updateDispalyName(uid, displayName, function(code) {
          if (code == 200) {
            // 刷新数据
            http.getUserInit(uid, function(json) {
              //个人信息
              self.$store.commit('setUser', json.me);
              //好友
              self.$store.commit('setUserFriendList', json.friends);
              //群
              self.$store.commit('setChatGroupList', json.groups);

              self.$Message.success('修改成功');
              self.showUpdDisPlayNameModal = false;
              self.newDisPlayName = '';
            });
          } else {
            self.$Message.warning('系统内部异常，请胖揍管理员');
          }
        });
      }
    },
    created: function() {
      this.user = this.$store.state.user;
    },
    mounted: function() {
    }
  };
</script>
<style lang="scss">
    @import './../styles/theme.scss';
    @import './../styles/v-im.scss';

    .v-im {
        display: flex;
        flex-direction: row;

        .left-bar {
            background-color: #1c2438;
            width: 6rem;
            height: 100%;

            ul {
                margin: 3rem 1.2rem 1.2rem 1.2rem;
                list-style: none;

                li {
                    -webkit-app-region: no-drag;
                    display: block;
                    width: 3.6rem;
                    height: 3.6rem;
                    text-align: center;
                    margin-bottom: 2rem;
                    cursor: pointer;

                    .ivu-icon {
                        font-size: 3rem !important;
                        color: $color-default;
                        margin: 0.3rem;
                        cursor: pointer;

                        &:hover {
                            color: $color-write;
                        }
                    }

                    .router-link-active {
                        .ivu-icon {
                            color: $color-write;
                        }
                    }
                }

                .userPhoto {
                    margin-bottom: 2rem;

                    img {
                        width: 3.6rem;
                        height: 3.6rem;
                    }
                }
            }
        }

        .content {
            flex: 1;
        }
    }
</style>
