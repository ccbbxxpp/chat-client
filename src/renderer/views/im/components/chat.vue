<template>
    <div class="im-chat" v-if="chat.displayName">
        <div class="im-chat-top" v-if="chat">
            <span v-if="chat.alias">{{ chat.alias }}</span>
            <span v-if="!chat.alias">{{ chat.displayName }}</span>
            <a href="javascript:;" @click="modal = true" class="pull-right menu">
                <Icon type="md-menu"/>
            </a>
        </div>
        <div class="im-chat-main">
            <div class="im-chat-main-left">
                <div class="im-chat-main-box messages" id="message-box">
                    <ul>
                        <li v-for="item in messageList" :class="{'im-chat-mine': item.mine}">
                            <div class="im-chat-user">
                                <img :src="item.avatar" alt="头像">
                                <cite v-if="item.mine"><i>{{ item.timestamp }}</i>{{ item.username }}</cite>
                                <cite v-else="item.mine">{{ item.username }}<i>{{ item.timestamp }}</i></cite>
                            </div>
                            <div class="im-chat-text">
                                <pre v-html="item.content" v-on:click="openImageProxy($event)"></pre>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="im-chat-footer">
                    <div class="im-chat-tool">
                        <Icon type="ios-happy-outline" @click="showFaceBox()"></Icon>
                        <Upload :action="action" name="file"
                                :format="imgFormat"
                                :data="tokenImg"
                                :show-upload-list="false"
                                :headers="headers"
                                :max-size="5120"
                                :with-credentials="true"
                                :before-upload="beforeUpload"
                                :on-progress="handleStart"
                                :on-format-error="handleFormatError"
                                :on-exceeded-size="handleImgMaxSize"
                                :on-success="handleSuccess"
                                :on-error="handleError">
                            <Icon type="ios-image-outline"></Icon>
                        </Upload>
                        <Upload :action="action" name="file"
                                :format="fileFormat"
                                :data="tokenFile"
                                :show-upload-list="false"
                                :headers="headers"
                                :max-size="1024000"
                                :with-credentials="true"
                                :before-upload="beforeUpload"
                                :on-progress="handleStart"
                                :on-format-error="handleFormatError"
                                :on-exceeded-size="handleFileMaxSize"
                                :on-success="handleSuccess"
                                :on-error="handleError">
                            <Icon type="ios-folder-open-outline"></Icon>
                        </Upload>
                        <Tooltip content="截图(Ctrl+Shift+A)" placement="bottom-start" :delay="500">
                            <Icon id="Capture" type="ios-cut-outline" @click="windCapture()"></Icon>
                        </Tooltip>
                        <Faces v-show="showFace" @click="showFace = true" class="faces-box"
                               @insertFace="insertFace"></Faces>
                        <!--<Button class="history-message-btn" @click="getHistoryMessage()">聊天记录</Button>
                        <Button class="history-message-btn" @click="updateInit(),updateKey = true">修改密钥</Button>-->
                    </div>
                    <!--<textarea v-model="messageContent" @keyup.enter="mineSend()"></textarea>-->
                    <ChatInput ref="child" v-model="messageContent" @sendMsg="sendMsg"
                               @returnMsg="returnMsg"></ChatInput>
                    <div class="im-chat-send">
                        <Button v-on:click="myclick">发送</Button>
                    </div>
                </div>
            </div>
            <div v-if="chat.type === '1'" class="im-chat-users">
                <ul class="chat-user-list">
                    <!--<li v-for="item in userList" @dblclick="showChat(item)" @click="showUser(item)">
                        <span class="im-chat-avatar">
                            &lt;!&ndash;<img :src="[host + item.avatar]" alt="" style="border-radius: 5px"/>&ndash;&gt;
                            <img :src="[item.portrait]" alt="" style="border-radius: 5px"/>
                        </span>
                        {{item.name}}
                    </li>-->
                    <li v-for="item in userList" @click="showUser(item)">
                        <span class="im-chat-avatar">
                            <!--<img :src="[host + item.avatar]" alt="" style="border-radius: 5px"/>-->
                            <img :src="[item.portrait]" alt="" style="border-radius: 5px"/>
                        </span>
                        {{item.displayName}}
                    </li>
                </ul>
            </div>
        </div>
        <!-- 展示用户信息 -->
        <Modal closable class="user-model" v-model="modal"
               footer-hide :title="chat.name" width="300">
            <p class="user-model-img">
                <img :src="chat.portrait" class="img" style="width: 60px"/>
            </p>
            <div v-if="chat.type === '0'">
                <p class="user-model-item">
                    <label>姓名：</label>
                    <span>{{chat.displayName}}</span>
                </p>
                <p class="user-model-item">
                    <label>账号：</label>
                    <span>{{chat.id}}</span>
                </p>
                <p class="user-model-item">
                    <label>邮箱：</label>
                    <span>{{chat.email}}</span>
                </p>
            </div>
            <div v-if="chat.type === '1'">
                <p class="user-model-item">
                    <label>群名称：</label>
                    <span>{{chat.displayName}}</span>
                </p>
            </div>
        </Modal>
        <Drawer title="聊天记录" :closable="true" v-model="showHistory" class="history-message" width="60%">
            <div class="im-chat-main">
                <div class="messages" id="his-chat-message">
                    <ul>
                        <li v-for="item in hisMessageList" :class="{'im-chat-mine': item.mine}">
                            <div class="im-chat-user" id="historyMessageBox">
                                <img :src="[host + item.avatar]">
                                <cite v-if="item.mine"><i>{{ item.timestamp }}</i>{{ item.username }}</cite>
                                <cite v-else="item.mine">{{ item.username }}<i>{{ item.timestamp }}</i></cite>
                            </div>
                            <div class="im-chat-text">
                                <pre v-html="item.content" v-on:click="openImageProxy($event)"></pre>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <Page :total="count" size="small" show-total class="page" :page-size="pageSize"
                  @on-change="getHistoryMessage"/>
        </Drawer>
        <!-- 弹出层，弹出修改密钥界面 Start -->
        <Modal closable class="user-model" v-model="updateKey" footer-hide title="修改秘钥" width="300">
            <div>
                <div class="search bar1">
                    <form>
                        KEY：
                        <input type="text" v-model="key" placeholder="请输入key(固定长度16位)" style="
                           border: 2px solid #ccc;
                           padding: 7px 0px;
                           border-radius: 3px;
                           padding-left:5px;
                           color: red;
                           font-style: italic;
                           font-size: 15px">
                        <br/>
                        I&nbsp;&nbsp;&nbsp;V：&nbsp;
                        <input type="text" v-model="iv" placeholder="请输入iv(固定长度16位)" style="
                            margin-top: 20px;
                           border: 2px solid #ccc;
                           padding: 7px 0px;
                           border-radius: 3px;
                           padding-left:5px;
                           color: green;
                           font-style: oblique;
                           font-size: 15px">
                        <div style="text-align: center">
                            <Button type="info" v-on:click="updateKeyAndIv" style="margin-top: 10px;margin-right: 5px">
                                确认修改
                            </Button>
                            <Button type="success" style="margin-top: 10px;margin-left: 5px" v-on:click="delKeyAndIv">
                                删除密钥
                            </Button>
                        </div>
                        <h1 align="center" style="color: darkgoldenrod ">
                            <!-- 提示信息显示位置 -->
                            {{resultmsg}}
                        </h1>
                    </form>
                </div>
            </div>
        </Modal>
        <!-- 弹出层，弹出修改密钥界面 End -->

    </div>
</template>

<script>
  import { ipcRenderer } from 'electron';
  import Button from 'iview/src/components/button/button';
  import conf from '../conf';
  import Faces from './faces.vue';
  import ChatInput from './chatInput';
  import winControl from '../../../../main/windowControl.js';
  import windowCapture from '../../../../main/windowCapture.js';
  import { fetchPost, formUpload } from '../utils/chatUtils';
  import aesUtil from '../utils/aesUtil';
  import MessageUtil from '../utils/MessageUtil';
  import HtmlUtil from '../utils/HtmlUtil';

  const { imageLoad, transform, ChatListUtils } = require('../utils/chatUtils');

  export default {
    components: {
      Faces,
      Button,
      ChatInput,
      aesUtil
    },
    name: 'userChat',
    computed: {
      messageList: {
        get: function() {
          return this.$store.state.messageList;
        },
        set: function(messageList) {
          this.$store.commit('setMessageList', messageList);
        }
      }
    },
    created: function() {
      let self = this;
      ipcRenderer.on('global-shortcut', function() {
        self.windCapture();
      });
    },
    data() {
      return {
        newWindowObj: null,//新窗口对象
        imgUrlHead: 'static',
        key: '',
        iv: '',
        resultmsg: '',
        updateKey: false,
        host: conf.getHostUrl(),
        count: 0,
        pageSize: 20,
        modal: false,
        showHistory: false,
        hisMessageList: [],
        // 保存各个聊天记录的map
        messageListMap: new Map(),
        messageContent: '',
        showFace: false,
        userList: [],
        imgFormat: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        fileFormat: ['doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'xls', 'xlsx', 'pdf', 'gif', 'exe',
          'msi', 'swf', 'sql', 'properties', 'yml', 'pom', 'bat', 'rar', 'RAR', 'apk', 'psd', 'txt', 'zip',
          'js', 'vue', 'css', 'html', 'java', 'jar', 'mp3', 'mp4', 'avi', '7z', '7Z', 'php', 'webp'],
        tokenImg: {
          access_token: sessionStorage.getItem('token'),
          type: 'image'
        },
        tokenFile: {
          access_token: sessionStorage.getItem('token'),
          type: 'file'
        },
        action: conf.getHostUrl() + '/api/upload',
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      };
    },
    props: ['chat'],
    methods: {
      //点击修改密钥时初始化信息
      updateInit: function() {
        let self = this;
        let currentUser = self.$store.state.user;
        let type = self.chat.type;
        let keyStr = '';
        let ivStr = '';
        let toId = '';
        toId = self.chat.id;
        try {
          let keyObj = JSON.parse(window.localStorage.getItem(toId));
          keyStr = keyObj.key;
          ivStr = keyObj.iv;
        } catch (e) {
          keyStr = '';
          ivStr = '';
        }
        self.key = keyStr;
        self.iv = ivStr;
        self.resultmsg = '';
      },
      //修改密钥
      updateKeyAndIv: function() {
        this.resultmsg = '';
        let self = this;
        let key = self.key;
        let iv = self.iv;
        if (key.length != 16) {
          this.resultmsg = 'key的长度必须为16位';
        } else if (iv.length != 16) {
          this.resultmsg = 'iv的长度必须为16位';
        } else {
          let toId = self.chat.id;//根据发送对象来进行存储
          let keys = {
            key: key,
            iv: iv
          };
          window.localStorage.setItem(toId, JSON.stringify(keys));
          this.resultmsg = '修改成功';
        }
      },
      //删除密钥
      delKeyAndIv: function() {
        this.key = '';
        this.iv = '';
        let toId = this.chat.id;
        window.localStorage.setItem(toId, '');
        this.resultmsg = '删除成功';
      },
      showChat(user) {
        let self = this;
        if (user.userId !== self.$store.state.user.userId) {
          let chat = ChatListUtils.resetChatList(self, user, conf.getHostUrl());
          self.$store.commit('setCurrentChat', chat);
        } else {
          self.$Message.warning('不能给自己说话哦');
        }
      },
      showUser: function() {
      },
      beforeUpload() {
        this.tokenImg = {
          access_token: sessionStorage.getItem('token'),
          type: 'image'
        };
        this.tokenFile = {
          access_token: sessionStorage.getItem('token'),
          type: 'file'
        };
        return new Promise(resolve => {
          this.$nextTick(function() {
            resolve(true);
          });
        });
      },
      // 错误提示
      openMessage(error) {
        this.$Message.error(error);
      },
      showFaceBox: function() {
        this.showFace = !this.showFace;
      },
      insertFace: function(item) {
        this.messageContent = this.messageContent + 'face' + item;
        this.showFace = false;
      },
      handleStart() {
        this.$Loading.start();
      },
      handleFormatError(file) {
        this.$Message.warning('文件 ' + file.name + ' 格式不正确。');
      },
      handleImgMaxSize(file) {
        this.$Message.warning('图片 ' + file.name + ' 太大，不能超过 5M！');
      },
      handleFileMaxSize(file) {
        this.$Message.warning('文件 ' + file.name + ' 太大，不能超过 1000M！');
      },
      handleSuccess(res, file) {
        let self = this;
        if (res.msg === 'success') {
          let path = res.filePath;
          let fileName = file.name;
          // 文件后缀
          let suffix = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length);
          // 文件
          if (self.imgFormat.indexOf(suffix) === -1) {
            if (suffix === 'mp4' || suffix === 'flv' || suffix === 'm3u8') {
              this.messageContent = path;
              self.chat.length = JSON.stringify(res.videoInfo);
            } else {
              this.messageContent = this.messageContent + 'file(' + path + ')[' + fileName + ']';
            }

          }
          // 图片
          else {
            // this.messageContent = this.messageContent + 'img[' + path + ']';
            this.messageContent = this.messageContent + '<img class="message-img" src="' + path + '">';
          }
          this.$Loading.finish();
        } else {
          this.$Message.error('文件上传错误，请重试');
        }
      },
      handleError: function() {
        this.$Loading.finish();
        this.$Message.error('上传错误！');
      },
      // 附件和图片点击展开
      openImageProxy: function(event) {
        event.preventDefault();
        // 图片预览，在新窗口中打开
        if (event.target.nodeName === 'IMG') {
          if (this.newWindowObj != null) {
            // 如已打开一个图片预览窗口就先把之前的创库关闭在重新打开
            this.newWindowObj.close();
          }
          let imgUrl = event.target.src;//图片的地址
          let imgHight = event.target.naturalHeight;//图片的原始高度
          let imgWidth = event.target.naturalWidth;//图片的原始宽度
          let windowHight = imgHight + 50;//新窗口的长度
          let windowWidth = imgWidth + 50;//新窗口的宽度
          let newWindowSize = 'height=' + windowHight + ',width=' + windowWidth;
          //路由到新窗口并打开页面
          let routeData = this.$router.resolve({
            path: '/imgShowWindow'
          });
          let url = routeData.href;
          let param = '?imgurl=' + imgUrl;
          this.newWindowObj = window.open(url + param, '_search', newWindowSize);
        } else if (event.target.className === 'message-file') {
          //文件预览在浏览器中打开
          winControl.openURL(event.target.href);
        }
      },
      sendMsg() {
        // 本人发送信息
        this.mineSend();
      },
      mineSend() {
        let self = this;
        let currentUser = self.$store.state.user;
        let content = self.messageContent;
        if (content !== '' && content !== '\n') {
          if (content.length > 2000) {
            self.openMessage('不能超过2000个字符');
            self.messageContent = '';
          } else {
            let username = currentUser.displayName;
            let avatar = currentUser.portrait;
            let id = self.chat.id;
            let type = self.chat.type;
            let content = self.messageContent;
            content = HtmlUtil.htmlDecodeByRegExp(content);
            let mine = true;
            let fromid = currentUser.userId;
            let timestamp = new Date().getTime();
            let length = self.chat.length;
            let msgType = 1;
            let msgId = timestamp + fromid + id;
            let message = new MessageUtil(username, avatar, id, type, content, mine, fromid, timestamp, length, msgType, msgId);
            message.sendMsg(message);
            self.$store.commit('addMessage', message);
            message.timestamp = self.formatDateTime(new Date(message.timestamp));
            // 每次滚动到最底部
            self.$nextTick(() => {
              imageLoad('message-box');
            });
            //self.send(message);
          }
        }
      },
      returnMsg(input) {
        this.messageContent = input;
      },
      myclick: function() {
        this.$refs.child.submit();
      },
      //截图
      windCapture() {
        let self = this;
        windowCapture.openScreenShot(function(image) {
          let chat = document.querySelectorAll('.chat-box .im-chat');
          if (chat.length == 0) {
            return false;
          } else {
            let param = new FormData();
            /*  let img = new Image();
              img.src = image.toDataURL();
              let data = self.compress(img);*/
            let bytes = window.atob(image.toDataURL().split(',')[1]);
            let array = [];
            for (let i = 0; i < bytes.length; i++) {
              array.push(bytes.charCodeAt(i));
            }
            let blob = new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
            param.set('file', blob, Date.now() + '.jpg');
            formUpload(
              conf.getUploadUrl(),
              param,
              function(json) {
                if (json.msg == 'success') {
                  let html = '<img class=\'message-img\'  src=\'' + json.filePath + '\' alt=\'\' />';
                  self.messageContent += html;
                }
              },
              self
            );
          }
        });
      },
      // 压缩图片
      compress(img) {
        let originWidth = img.width, // 压缩前的宽
          originHeight = img.height,
          maxWidth = 500, maxHeight = 400,
          quality = 0.8, // 压缩质量
          canvas = document.createElement('canvas'),
          drawer = canvas.getContext('2d');
        let width = maxWidth;
        let height = originHeight / originWidth * maxWidth;
        // 创建属性节点
        let anw = document.createAttribute('width');
        anw.nodeValue = width;
        let anh = document.createAttribute('height');
        anh.nodeValue = height;
        canvas.setAttributeNode(anw);
        canvas.setAttributeNode(anh);
        drawer.drawImage(img, 0, 0, width, height);
        let ndata = canvas.toDataURL('image/jpeg', quality); // 压缩后的base64图片
        return ndata;
      },
      // base64转成bolb对象
      dataURItoBlob(base64Data) {
        var byteString;
        if (base64Data.split(',')[0].indexOf('base64') >= 0)
          byteString = atob(base64Data.split(',')[1]);
        else byteString = unescape(base64Data.split(',')[1]);
        var mimeString = base64Data
          .split(',')[0]
          .split(':')[1]
          .split(';')[0];
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ia], { type: mimeString });
      },
      getHistoryMessage(pageNo) {
        let self = this;
        self.showHistory = true;
        if (!pageNo) {
          pageNo = 1;
        }
        let param = new FormData();
        param.set('chatId', self.chat.id);
        param.set('chatType', self.chat.type);
        param.set('fromId', self.$store.state.user.id);
        param.set('pageNo', pageNo);
        fetchPost(
          conf.getHisUrl(),
          param,
          function(json) {
            //todo 聊天记录解码 Start
            let msgList = json.messageList;
            for (let msg of msgList) {
              //第一步：获取当前聊天窗口指定的特殊密钥，若未指定就使用系统自带密钥
              let userId = self.$store.state.user.id;//当前用户的ID
              let toId = msg.id;//接收人的ID
              if (userId == toId) {//聊天记录为互发消息，进行反向解码
                toId = msg.fromid;
              }
              let keyStr = '';
              let ivStr = '';
              try {
                let keyObj = JSON.parse(window.localStorage.getItem(toId));
                keyStr = keyObj.key;
                ivStr = keyObj.iv;
              } catch (e) {
                keyStr = '';
                ivStr = '';
              }
              //第二步：使用默认密钥或指定密钥对聊天记录进行解密
              let content = msg.content;
              try {
                content = aesUtil.Decrypt(content, keyStr, ivStr);
              } catch (e) {
                content = msg.content;
              }
              if (content == '') {
                content = msg.content;
              }
              msg.content = content;
              let msgType = msg.msgType;//消息内容 video voice img
              if (msgType == 'img') {
                if (content.indexOf('class') == -1) {
                  let url = content.substring(10, content.length - 2);
                  let html = '<img class=\'message-img\'  src=\'' + url + '\' alt=\'\' />';
                  msg.content = html;
                }
              }
              if (msgType == 'voice') {//语音消息
                let url = content;
                const voiceContent = 'file(' + url + ')[animation.mp3]';
                msg.content = voiceContent;
              }
              if (msgType == 'video') {//视频消息
                let url = content;
                const videoContent = 'file(' + url + ')[animation.mp4]';
                msg.content = videoContent;
              }
            }
            json.messageList = msgList;
            //todo 聊天记录解码 End
            let list = json.messageList.map(function(element) {
              element.content = transform(element.content);
              return element;
            });
            let tempList = list.map(function(message) {
              message.timestamp = self.formatDateTime(new Date(message.timestamp));
              return message;
            });
            self.hisMessageList = tempList.reverse();
            self.count = json.count;
            self.pageSize = json.pageSize;
            // 每次滚动到最底部
            self.$nextTick(() => {
              imageLoad('his-chat-message');
            });
          },
          self
        );
      }
    },
    beforeMount() {

    },
    watch: {
      // 监听每次 user 的变化
      chat: function() {
        let self = this;
        self.messageList = [];
        // 从内存中取聊天信息
        let cacheMessages = self.$store.state.messageListMap.get(self.chat.id);
        if (cacheMessages) {
          self.messageList = cacheMessages;
        }
        // 每次滚动到最底部
        this.$nextTick(() => {
          imageLoad('message-box');
        });
        if (self.chat.type === '1') {
          let self = this;
          let groupList = self.$store.state.chatGroupList;
          let currentGroup;
          if (groupList != null) {
            for (let i = 0; i < groupList.length; i++) {
              let groupId = groupList[i].groupId;
              if (groupId == self.chat.id) {
                currentGroup = groupList[i];
                self.userList = currentGroup.groupUser;
              }
            }
          }
        }
      }
    },
    mounted: function() {
      // 每次滚动到最底部
      this.$nextTick(() => {
        imageLoad('message-box');
      });
    }
  };
</script>

<style lang="scss">
    @import '../../../styles/theme';

    .im-chat {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-top: 4rem;
    }

    .im-chat-top {
        border-bottom: 1px solid #cccccc;
        color: $color-default;
        padding: 0 0 0.2rem 1rem;
        font-size: 1.6rem;
        font-weight: bold;

        .menu {
            color: $color-default;
            display: inline-block;
            padding: 0 10px;
        }
    }

    .img-model {
        background: rgba(0, 0, 0, 0.5) !important;

        img {

        }
    }

    .user-model {
        .user-model-img {
            padding: 30px;
            text-align: center;

            img {
                border-radius: 50%;
            }
        }

        .user-model-item {
            display: flex;
            padding: 5px 0;

            label {
                flex: 2;
                font-weight: bold;
                text-align: right;
            }

            span {
                flex: 3;
            }
        }
    }

    .im-chat-main {
        flex: 1;
        display: flex;
        flex-direction: row;
        height: 100%;

        .im-chat-main-left {
            flex: 4;
            display: flex;
            flex-direction: column;

            .im-chat-main-box {
                flex: 1;
                padding-top: 1rem;
                overflow-x: hidden;
                overflow-y: auto;
            }
        }

        .message-img {
            max-width: 20rem;
        }

        .im-chat-users {
            flex: 1;
            border-left: 1px solid #cccccc;
            overflow-y: scroll;
        }

        .messages {
            width: 100%;
            height: calc(100% - 3rem);
            overflow-y: scroll;

            ul {
                width: 100%;

                li {
                    position: relative;
                    font-size: 0;
                    margin-bottom: 10px;
                    padding-left: 60px;
                    min-height: 68px;

                    .im-chat-text {
                        position: relative;
                        line-height: 22px;
                        margin-top: 25px;
                        padding: 0.8rem 1.5rem;
                        background-color: #e2e2e2;
                        border-radius: 3px;
                        color: #333;
                        word-break: break-all;
                        display: inline-block;
                        vertical-align: top;
                        font-size: 14px;

                        &:after {
                            content: '';
                            position: absolute;
                            left: -10px;
                            top: 13px;
                            width: 0;
                            height: 0;
                            border-style: solid dashed dashed;
                            border-color: #e2e2e2 transparent transparent;
                            overflow: hidden;
                            border-width: 10px;
                        }

                        pre {
                            width: 100%;
                            white-space: pre-wrap;
                            word-break: break-all;
                        }
                    }
                }
            }

            .im-chat-user {
                width: 4rem;
                height: 4rem;
                position: absolute;
                display: inline-block;
                vertical-align: top;
                font-size: 14px;
                left: 3px;
                right: auto;

                cite {
                    position: absolute;
                    left: 60px;
                    top: -2px;
                    width: 500px;
                    line-height: 24px;
                    font-size: 12px;
                    white-space: nowrap;
                    color: #999;
                    text-align: left;
                    font-style: normal;

                    i {
                        font-style: normal;
                        padding-left: 15px;
                    }
                }

                img {
                    width: 4rem;
                    height: 4rem;
                    border-radius: 100%;
                }
            }

            .im-chat-mine {
                text-align: right;
                padding-left: 0;
                padding-right: 60px;

                .im-chat-text {
                    margin-left: 0;
                    text-align: left;
                    background-color: $color-message-bg;
                    color: #fff;
                    display: inline-block;
                    vertical-align: top;
                    font-size: 14px;

                    &:after {
                        left: auto;
                        right: -10px;
                        border-top-color: $color-message-bg;
                    }
                }

                .im-chat-user {
                    left: auto;
                    right: 3px;

                    cite {
                        left: auto;
                        right: 60px;
                        text-align: right;

                        i {
                            padding-left: 0;
                            padding-right: 15px;
                        }
                    }
                }
            }
        }
    }

    .im-chat-footer {
        border-top: 1px solid $color-gray;
        height: 15rem;
        display: flex;
        flex-direction: column;

        .im-chat-tool {
            padding: 0.5rem 1rem;
            height: 3.4rem;
            position: relative;

            i {
                font-size: 2.4rem;
                cursor: pointer;
                margin-left: 1rem;
            }

            .faces-box {
                position: absolute;
                bottom: 3.8rem;
            }

            .ivu-upload {
                display: inline-block;
            }

            .history-message-btn {
                float: right;
            }
        }

        textarea {
            border: 0;
            padding: 0.5rem;
            width: 100%;
            flex: 1;
            resize: none;

            &:focus {
                border: 0;
            }
        }

        .im-chat-send {
            height: 4rem;
            text-align: right;
            padding: 0 1rem 1rem 0;
        }
    }

    .ivu-scroll-wrapper {
        margin: 0 !important;
    }

    .ivu-scroll-container {
        padding: 15px 15px 5px;
        overflow-y: visible !important;
    }

    /* 重新覆盖iview 里面的 model 小于768px 时候 宽度变100% 的问题 */
    @media (max-width: 768px) {
        .user-model {
            .ivu-modal {
                width: 30rem !important;
                margin: 0 auto;
            }
        }
    }

    .history-message {
        width: 80%;
        height: calc(100% - 30px);
    }

    .page {
        position: fixed;
        bottom: 0;
        width: 100%;
        margin: 0.5rem;
    }

    .ivu-drawer-body {
        padding: 0 !important;

        .messages {
            height: calc(100% - 3rem);
        }
    }

    .chat-user-list {
        list-style: none;
        margin: 0;
        padding: 1rem;

        & > li {
            margin-bottom: 1rem;
            cursor: pointer;

            & > .im-chat-avatar {
                width: 3.2rem;
                height: 3.2rem;
                display: inline-block;
                vertical-align: middle;

                & > img {
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }
</style>
