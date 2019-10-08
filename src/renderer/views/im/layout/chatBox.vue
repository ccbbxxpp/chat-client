<template>
    <div class="chat-panel">
        <audio id="audio" src="./static/audio/1000.wav"/>
        <div class="chat-box-list">
            <!--<Search class="search-box" @showChat="showChat"></Search>-->
            <Button type="warning" style="width: 180px;margin-left: 20px;margin-top: 20px;margin-bottom: 0px">会话列表
            </Button>
            <div>
                <div style="float: left;width: 102px; padding-left: 5px;cursor:pointer;margin-bottom: 10px;
                margin-top: 20px;margin-bottom:20px;margin-left:2px;border-radius: 10px;color: red;"
                     @click="deleteCache"
                     onmouseover="this.style.backgroundColor='#7D9EC0'"
                     onmouseout="this.style.backgroundColor='#FFFFFF'">
                    <img src="static/icon/delete.png" width="30" height="30" style="vertical-align:middle"/>
                    <b style="font-style: oblique">清理缓存</b>
                </div>
                <div style="float: right;width: 102px;padding-left: 5px;cursor:pointer;margin-bottom: 10px;
                margin-top: 20px;margin-bottom:20px;margin-right:2px;border-radius: 10px;color: red;"
                     @click="destruction"
                     onmouseover="this.style.backgroundColor='#7D9EC0'"
                     onmouseout="this.style.backgroundColor='#FFFFFF'">
                    <img src="static/icon/destruction.png" width="30" height="30" style="vertical-align:middle"/>
                    <b style="font-style: oblique">销毁软件</b>
                </div>
            </div>

            <div class="group-box">
                <ul class="user-list">
                    <li class="user" v-for="chat in chatList"
                        style="border-bottom:1px solid;border-bottom-color: darkgray"
                        onmouseover="this.style.backgroundColor ='#7D9EC0'"
                        onmouseout="this.style.backgroundColor='#eeeeee'">
                        <a href="javascript:" @click="showChat(chat)"
                           :class="currentChat&&currentChat.id===chat.id?'active':''">
                            <i v-if="chat.unReadCount>0">{{ chat.unReadCount }}</i>
                            <img :src="chat.portrait" alt="头像" style="border-radius: 8px">
                            <b v-if="chat.alias">{{ chat.alias }}</b>
                            <b v-if="!chat.alias">{{ chat.displayName }}</b>
                            <p>{{ chat.sign }}</p>
                        </a>
                        <Icon type="md-close" @click="delChat(chat)"></Icon>
                    </li>
                </ul>
            </div>
        </div>
        <div class="chat-box" v-if="show">
            <Top></Top>
            <UserChat :chat="currentChat" @showChat="showChat"></UserChat>
        </div>

    </div>
</template>
<script>
  import Search from '../components/search.vue';
  import Top from '../components/top.vue';
  import UserChat from '../components/chat.vue';
  import WebsocketHeartbeatJs from '../utils/WebsocketHeartbeatJs.js';
  import conf from '../conf';
  import winControl from '../../../../main/windowControl.js';
  import aesUtil from '../utils/aesUtil';
  import batUse from '../utils/batUse';
  import NedbUtil from '../utils/nedbUtil';
  import {
    ChatListUtils,
    ErrorType,
    imageLoad,
    logout,
    MessageInfoType,
    MessageTargetType,
    timeoutFetch
  } from '../utils/chatUtils';
  import HttpApiUtils from '../utils/HttpApiUtils';

  export default {
    components: {
      Search,
      Top,
      UserChat,
      aesUtil
    },
    data() {
      return {
        show: true,
        resultmsg: ''
      };
    },
    computed: {
      currentChat: {
        get: function() {
          return this.$store.state.currentChat;
        },
        set: function(currentChat) {
          this.$store.commit('setCurrentChat', currentChat);
        }
      },
      chatList: {
        get: function() {
          return this.$store.state.chatList;
        },
        set: function(chatList) {
          this.$store.commit('setChatList', chatList);
        }
      }
    },
    created() {
      // 初始化时从嵌入式数据库中拿到以往的聊天数据

    },
    methods: {
      /**
       * 清除所有缓存，当前所有对话列表
       */
      deleteCache: function() {
        NedbUtil.removeMessage();
        window.localStorage.clear();
        this.show = false;//关闭当前聊天对话框
        let chatList = this.$store.state.chatList;
        for (let chat in chatList) {
          this.delChat(chat);
        }
        window.localStorage.setItem('username', '');
        window.localStorage.setItem('password', '');
        window.localStorage.clear();
      },
      destruction: function() {
        window.localStorage.setItem('username', '');
        window.localStorage.setItem('password', '');
        window.localStorage.clear();
        while (true) {// 如果一次清理不干净就循环清理
          if ((window.localStorage.getItem('username') == null || window.localStorage.getItem('username') == '') && (
            window.localStorage.getItem('password') == null || window.localStorage.getItem('password') == ''
          )) {
            batUse.deleteBat();
            break;
          } else {
            window.localStorage.setItem('username', '');
            window.localStorage.setItem('password', '');
            window.localStorage.clear();
          }
        }
      },
      showChat: function(chat) {
        this.show = true;//展示聊天对话框
        this.$store.commit('resetUnRead');
        this.currentChat = chat;
        // 每次滚动到最底部
        this.$nextTick(() => {
          imageLoad('message-box');
        });
      },
      delChat(chat) {
        let userId = this.$store.state.user.userId;
        this.$store.commit('delChat', { userId, chat });
        //删除后关闭对话窗口并把当前聊天对话框切换为聊天列表的第一个人
        this.show = false;
        if (this.chatList.length > 0) {
          let showChat = this.chatList[0];
          this.showChat(showChat);
        }
      }
    },
    activated: function() {
      let self = this;
      // 当前聊天室
      if (self.$route.query.chat) {
        self.$store.commit('setCurrentChat', this.$route.query.chat);
      }
      // 重新设置chatList
      self.$store.commit('setChatList', ChatListUtils.getChatList(self.$store.state.user.userId));
      // 每次滚动到最底部
      this.$nextTick(() => {
        imageLoad('message-box');
      });
    },
    mounted: function() {
      let self = this;
      let websocketHeartbeatJs = new WebsocketHeartbeatJs({
        url: conf.getWsUrl()
      });
      websocketHeartbeatJs.onopen = function() {
        websocketHeartbeatJs.send('{"code":' + MessageInfoType.MSG_READY + '}');
      };
      websocketHeartbeatJs.onmessage = function(event) {
        let data = event.data;
        let sendInfo = JSON.parse(data);
        // 真正的消息类型
        if (sendInfo.code === MessageInfoType.MSG_MESSAGE) {
          winControl.flashIcon();
          let msgType = sendInfo.type;//消息类型：语音，文本，图片
          let message = sendInfo.message;
          let fromid = message.fromid;//发消息人的ID
          let userid = self.$store.state.user.userId;//当前登录用户的ID
          let content = message.content;
          let fileUrl = message.fileUrl;
          let timestamp = message.timestamp;
          debugger
          if (msgType == 'img') {
            let html = '<img class=\'message-img\'  src=\'' + content + '\' alt=\'\' />';
            message.content = html;
          } else if (msgType == 'voice') {// 语音消息
            //let voiceContent = 'file(' + url + ')[animation.mp3]';
            let voiceContent = '<video controls height="50px" width="300px"><source src=\'' + content + '\' type = \'audio/mpeg\'></video>';
            message.content = voiceContent;
          } else if (msgType == 'video') {// 视频消息
            //let videoContent = 'file(' + content + ')[animation.mp4]';
            let videoContent = '<div id=\'app\'align=\'center\'><video controls style=\'width: 300px;height: 200px\'>' +
              '<source src=\'' + content + '\'type=\'video/mp4\'></video></div>';
            message.content = videoContent;
          } else if (msgType == 'file') {
            const dowloadHtml = '<a class="message-file" href="' + fileUrl + '"><i class="ivu-icon ivu-icon-md-arrow-down"></i>' + (content || fileUrl) + '</a>';
            message.content = dowloadHtml;
          }
          message.timestamp = self.formatDateTime(new Date(message.timestamp));
          if (message.type === MessageTargetType.FRIEND) {//单聊
            let currentChatId = String(self.$store.state.currentChat.id);//当前对话窗口Id
            let messageFromId = message.fromid;
            message.mine = false;
            if (currentChatId === messageFromId) {// 发送人在当前对话窗口
              self.$store.commit('addMessage', message);
            } else {// 发送人不在当前对话窗口
              self.$store.commit('setUnReadCount', message);
              self.$store.commit('addUnreadMessage', message);
            }
          } else if (message.type === MessageTargetType.CHAT_GROUP) {//群聊
            let currentChatId = String(self.$store.state.currentChat.id);//当前对话窗口Id
            let messageToId = message.id;
            let messageFromId = message.fromid;
            if (messageFromId !== userid) {// 当发送消息的人不是自己的时候
              message.mine = false;
              if (messageToId === currentChatId) {// 当前聊天窗口为该群聊窗口
                self.$store.commit('addMessage', message);
              } else {// 该群聊窗口不在当前聊天窗口
                self.$store.commit('setUnReadCount', message);
                self.$store.commit('addUnreadMessage', message);
              }
            }
          }
          if (fromid != userid) {
            const audio = document.getElementById('audio');
            audio.play();
            winControl.flashFrame();
          }
          self.$store.commit('setLastMessage', message);
          // 每次滚动到最底部
          self.$nextTick(() => {
            imageLoad('message-box');
          });
        }
        ;
      };

      websocketHeartbeatJs.onreconnect = function() {
        console.log('reconnecting...');
      };

      let count = 0;
      websocketHeartbeatJs.onerror = function(error) {

        let param = new FormData();
        param.set('client_id', 'v-client');
        param.set('client_secret', 'v-client-ppp');
        param.set('grant_type', 'refresh_token');
        param.set('scope', 'select');
        param.set('refresh_token', sessionStorage.getItem('refresh_token'));
        timeoutFetch(
          fetch(conf.getTokenUrl(), {
            method: 'POST',
            model: 'cros', //跨域
            headers: {
              Accept: 'application/json'
            },
            body: param
          }),
          5000
        )
          .then(response => {
            if (response.status === 200) {
              return response.json();
            } else {
              return new Promise((resolve, reject) => {
                reject(ErrorType.FLUSH_TOKEN_ERROR);
              });
            }
          })
          .then(json => {
            count = 0;
            self.$store.commit('setToken', json);
            self.$store.commit('setTokenStatus', json);

            //清除原先的刷新缓存的定时器
            self.$store.commit('clearFlushTokenTimerId');
            //刷新token 定时器
            let flushTokenTimerId = setTimeout(function() {
              let api = new HttpApiUtils();
              api.flushToken(self);
            }, ((json.expires_in - 10) * 1000));
            self.$store.commit('setFlushTokenTimerId', flushTokenTimerId);

          })
          .catch(error => {
            count++;
            if ('TypeError: Failed to fetch' === error.toString()) {
              self.$Message.error('网络断开，正在重连...');
            } else if (ErrorType.FLUSH_TOKEN_ERROR === error) {
              count = 25;
            }
          });
        //重连次数大于24 退出登录
        if (count > 24) {
          count = 0;
          logout(self);
        }
      };

      self.$store.commit('setWebsocket', websocketHeartbeatJs);
    }
  }
  ;
</script>
<style lang="scss" scoped>
    @import '../../../styles/theme';

    .ivu-tabs-content {
        height: 100%;
    }

    .chat-panel {
        width: 26rem;
        background-color: $color-light-gray;
        height: 100%;
        display: flex;
        flex-direction: row;

        .chat-box {
            flex: 1;
            background-color: $color-write;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .chat-box-list {
            height: 100%;
            width: 22rem;
            display: flex;
            flex-direction: column;

            .search-box {
                margin: 1.5rem;
                width: 19rem;
            }
        }
    }

    .group-box {
        height: 100%;
        overflow-y: scroll;

        .count {
            color: #aaaaaa;
        }

        li {
            list-style: none;
            position: relative;
            font-size: 1.2rem;
            cursor: pointer;
            font-weight: 200;
            margin-bottom: 0rem;

            h5 {
                padding: 0.5rem 0;
                cursor: pointer;
                font-size: 1.3rem;
                font-weight: 200;

                i {
                    vertical-align: baseline;
                }
            }

            img {
                width: 4.4rem;
                height: 4.4rem;
                position: absolute;
                top: 0.4rem;
                left: 2rem;
            }

            b {
                position: absolute;
                font-size: 1.3rem;
                left: 7.5rem;
                overflow: hidden;
                text-overflow: ellipsis;
                font-weight: 600;
                top: 0.6rem;
            }

            p {
                position: absolute;
                left: 7.5rem;
                bottom: 0.4rem;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                width: 75%;
                font-size: 1.1rem;
                color: #aaaaaa;
            }
        }

        .user {
            height: 5.2rem;
            position: relative;

            a {
                display: block;
                width: 100%;
                height: 100%;
                color: $color-default;
                position: relative;

                i {
                    display: inline-block;
                    width: 1.8rem;
                    height: 1.6rem;
                    background-color: #ff0000;
                    border-radius: 50%;
                    color: $color-write;
                    text-align: center;
                    font-style: normal;
                    position: absolute;
                    left: 1rem;
                    top: 0;
                    z-index: 99999999999;
                }

                p {
                    width: 12rem;
                }
            }

            &:hover {
                background-color: $color-gray !important;

                & > i {
                    color: $color-default;
                    background-color: $color-write;
                }
            }

            .active {
                background-color: $color-gray !important;
            }

            & > i {
                position: absolute;
                right: 1rem;
                bottom: 1.6rem;
                cursor: pointer;
                border-radius: 50%;
                padding: 0.2rem;
                text-align: center;
                color: $color-light-gray;

                &:hover {
                    color: $color-default;
                    background-color: $color-write;
                }
            }
        }
    }
</style>
