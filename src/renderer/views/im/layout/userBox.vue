<template>
    <!-- 此代码仅用作学习和参考，不得将其用作商业用途 -->
    <div class="user-box">
        <div class="user-box-list">
            <!--<Search class="search-box" @showChat="showChat"></Search>-->


            <div style="height: 35px;margin-top: 20px;margin-bottom: 5px">
                <div style="width: 170px;float: left">
                    <Button type="success" style="width: 160px;margin-left: 10px;"
                            @click="showAddFriendRequestModal = true">新的朋友
                    </Button>
                </div>
                <div style="width: 40px;float: right;cursor: pointer">
                    <img src="static/icon/add.png" @click="showAddModal=true"
                         style="width: 32px;height: 32px"/>
                </div>
            </div>
            <div class="group-box">
                <ul class="group-list">
                    <li>
                        <h5 v-on:click="showGroup = !showGroup">
                            <Icon type="ios-arrow-forward" v-if="!showGroup"/>
                            <Icon type="ios-arrow-down" v-if="showGroup"/>
                            <span>我的好友</span>
                            <span class="count">({{ userFriendList.length }})</span>
                        </h5>
                        <transition name="fade">
                            <ul class="userList" v-if="showGroup">
                                <li class="user" v-for="user in userFriendList"
                                    style="border-radius: 10px"
                                    onmouseover="this.style.backgroundColor='#7D9EC0'"
                                    onmouseout="this.style.backgroundColor='#eeeeee'">
                                    <a href="javascript:;" @dblclick="showChat(user)" @click="showFriendDetail(user)">
                                        <img :src="[user.portrait]">
                                        <b v-if="user.alias">{{ user.alias }}</b>
                                        <b v-if="!user.alias">{{ user.displayName }}</b>
                                        <!--<p>{{ user.sign }}</p>-->
                                    </a>
                                </li>
                            </ul>
                        </transition>
                    </li>
                </ul>
            </div>
        </div>
        <div class="chat-box">
            <Top></Top>
            <div class="friends-detail" v-if="showFriend">
                <div class="friends-information">
                    <p>
                        <img :src="friend.portrait"/>
                    </p>
                    <p>
                        <label>姓名：</label>
                        <span>{{friend.displayName}}</span>
                    </p>
                    <p>
                        <label>账号：</label>
                        <span>{{friend.name}}</span>
                    </p>
                    <p v-if="friend.alias">
                        <label>备注：</label>
                        <span>{{friend.alias}}</span>
                    </p>
                    <p v-if="friend.email">
                        <label>邮箱：</label>
                        <span>{{friend.email}}</span>
                    </p>
                </div>

                <div class="friends-botton">
                    <Button long type="success" @click="showChat(friend)">发消息</Button>
                    <Button long type="warning" @click="updateFriendModal=true">设置昵称或别名</Button>
                    <Button long type="error" @click="deleteFriendModal = true">删除好友</Button>
                </div>
            </div>
        </div>

        <div>
            <!-- 设置好友备注 -->
            <Modal closable v-model="updateFriendModal" footer-hide title="设置用户备注" width="300">
                <b>备注名：</b>
                <input placeholder="请输入好友备注" v-model="friendAlias"
                       style="height: 30px;border-bottom-color: #2b85e4;border-style: none none solid none">
                <Button long type="success" style="margin-top: 20px" @click="updateFriendName()">保存</Button>
            </Modal>

            <!-- 好友请求 -->
            <Modal closable v-model="showAddFriendRequestModal" footer-hide title="好友请求" width="400">
                <div style="height: 280px;overflow-y: scroll;margin-bottom: 20px">
                    <ul>
                        <li v-for="f in addFriendRequestList"
                            style="height: 68px;border-bottom:1px solid;border-bottom-color: darkgray;margin:10px 10px 0px 10px;list-style: none;">
                            <!-- 头像 -->
                            <div style="float: left;height: 55px;width: 55px">
                                <img :src="f.portrait" style="width: 48px;height: 48px;border-radius: 10px">
                            </div>
                            <!-- 用户信息和请求信息 -->
                            <div style="float: left;height: 55px;width: 230px">
                                <div>
                                    <b>
                                        {{f.displayName}}
                                    </b>
                                </div>
                                <div style="margin-top: 10px;color: #999999">
                                    <p>{{f.verificationMsg}}</p>
                                </div>
                            </div>
                            <!-- 操作按钮 -->
                            <div style="float: right;height: 68px;width: 50px">
                                <Button type="success"
                                        style="float: top;height: 30px;">添加
                                </Button>
                                <Button type="error"
                                        style="float: bottom;margin-top:5px;height: 30px">忽略
                                </Button>
                            </div>
                        </li>
                    </ul>
                </div>
            </Modal>

            <!-- 添加好友或发起群聊 -->
            <Modal closable v-model="showAddModal" footer-hide title="添加好友或发起群聊" width="300">
                <div>
                    <Button type="success" long @click="showAddModal=false,showAddFriendModal=true"
                            style="margin-bottom: 20px">添加好友
                    </Button>
                    <Button type="warning" long>发起群聊</Button>
                </div>
            </Modal>

            <!-- 添加好友 -->
            <Modal closable v-model="showAddFriendModal" footer-hide title="添加好友" width="350">
                <div>
                    <input placeholder="请输入好友账号"
                           style="height: 30px;width:230px;border-bottom-color: #2b85e4;border-style: none none solid none;margin-bottom: 20px">
                    <Button type="success" style="width: 70px;margin-left: 14px">查询</Button>
                </div>
                <div>
                    <ul>
                        <li v-for="f in seachFriendsList"
                            style="height: 55px;border-bottom:1px solid;border-bottom-color: darkgray;margin:10px 10px 0px 10px;list-style: none;">
                            <!-- 头像 -->
                            <div style="float: left;height: 55px;width: 55px">
                                <img :src="f.portrait" style="width: 48px;height: 48px;border-radius: 10px">
                            </div>
                            <!-- 用户信息和请求信息 -->
                            <div style="float: left;height: 55px;width: 150px">
                                <div>
                                    <b>
                                        {{f.displayName}}
                                    </b>
                                </div>
                            </div>
                            <!-- 操作按钮 -->
                            <div style="float: right;height: 68px;width: 50px">
                                <Button type="success"
                                        style="height: 30px;margin-top: 10px">添加
                                </Button>
                            </div>
                        </li>
                    </ul>
                </div>
            </Modal>

            <!-- 删除好友 -->
            <Modal closable v-model="deleteFriendModal" footer-hide title="确认删除该好友吗？" width="300">
                <div style="margin-left: 68px">
                    <Button type="warning" style="margin-right: 10px" @click="deleteFriends()">确认</Button>
                    <Button type="success" @click="deleteFriendModal=false">取消</Button>
                </div>

            </Modal>
        </div>
    </div>


</template>
<script>
  import Search from '../components/search.vue';
  import Top from '../components/top.vue';
  import Welcome from '../components/welcome.vue';
  import HttpUtils from '../utils/HttpUtils';
  import conf from '../conf';

  /**
   * 此代码仅用作学习和参考，不得将其用作商业用途
   */
  const {
    ChatListUtils
  } = require('../utils/chatUtils.js');

  export default {
    components: {
      Search,
      Top,
      Welcome
    },
    created: function() {
      this.user = this.$store.state.user;
    },
    computed: {
      userFriendList: {
        get: function() {
          return this.$store.state.userFriendList;
        },
        set: function(userFriendList) {
          this.$store.commit('setUserFriendList', userFriendList);
        }
      }
    },
    data() {
      return {
        showGroup: true,
        chat: {},
        user: {},
        currentUser: {},
        showFriend: false,
        friend: {},
        updateFriendModal: false,//修改好友备注
        friendAlias: '',//好友备注
        showAddFriendRequestModal: false,//好友申请modal
        showAddModal: false,
        showAddFriendModal: false,
        deleteFriendModal: false,
        seachFriendsList: [
          {
            'displayName': '周星驰',
            'portrait': 'static/img/user48.png'
          }
        ],
        addFriendRequestList: [
          {
            'displayName': '马云',
            'portrait': 'static/img/user30.png',
            'verificationMsg': '我是马云'
          }, {
            'displayName': '马化腾',
            'portrait': 'static/img/user15.png',
            'verificationMsg': '我是马化腾'
          }, {
            'displayName': '任正非',
            'portrait': 'static/img/user25.png',
            'verificationMsg': '我是任正非'
          }, {
            'displayName': '雷军',
            'portrait': 'static/img/user28.png',
            'verificationMsg': '我是雷军'
          }
        ]
      }
        ;
    },
    methods: {
      // 打开一个聊天对话框
      showChat: function(user) {
        let self = this;
        let chat = ChatListUtils.resetChatList(self, user, '0');
        self.$router.push({
          path: '/index/chatBox',
          query: {
            chat: chat
          }
        });
      },
      // 展示好友明细信息
      showFriendDetail(friend) {
        this.friend = friend;
        this.showFriend = true;
      },
      // 修改好友备注
      updateFriendName() {
        let self = this;
        let uid = self.user.userId;
        let fid = self.friend.userId;
        let alias = self.friendAlias;
        this.friendAlias = '';
        this.updateFriendModal = false;
        let httpUtils = new HttpUtils();
        httpUtils.updateFriendName(uid, fid, alias, function(code, json) {
          if (code == 200 && json) {
            //个人信息
            self.$store.commit('setUser', json.me);
            //好友
            self.$store.commit('setUserFriendList', json.friends);
            //群
            self.$store.commit('setChatGroupList', json.groups);
            self.$Message.success('好友备注修改成功');
          } else {
            self.$Message.warning('修改失败');
          }
        });
      },
      // 删除好友
      deleteFriends() {
        let self = this;
        let uid = self.$store.state.user.userId;
        let fid = self.friend.userId;
        let http = new HttpUtils();
        http.setFriendsStatus(uid, fid, 1, function(code) {
          if (code == 200) {
            http.getUserInit(uid, function(json) {
              //个人信息
              self.$store.commit('setUser', json.me);
              //好友
              self.$store.commit('setUserFriendList', json.friends);
              //群
              self.$store.commit('setChatGroupList', json.groups);

              self.$Message.success('删除成功！');
              self.deleteFriendModal = false;
              self.friend = json.friends[0];
              return;
            });
          } else {
            self.$Message.error('删除失败，请联系管理员！');
          }
        });
      }
    }
  };
</script>
<style lang="scss" scoped>
    @import '../../../styles/theme';

    .ivu-tabs-content {
        height: 100%;
    }

    .user-box {
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

            .friends-detail {
                margin-top: 80px;
                margin-left: 150px;
                margin-right: 150px;
                text-align: center;

                .friends-botton {
                    button {
                        margin-top: 20px;
                    }
                }

                .friends-information {
                    img {
                        width: 100px;
                        height: 100px;
                        border-radius: 10px
                    }
                }
            }
        }

        .user-box-list {
            height: 100%;
            width: 22rem;
            display: flex;
            flex-direction: column;

            .search-box {
                margin: 1.5rem;
                width: 19rem;
            }

            .group-box {
                overflow-y: scroll;
                flex: 1;

                .group-list {
                    margin: 0 1rem;

                    .count {
                        color: #aaaaaa;
                    }

                    li {
                        list-style: none;
                        position: relative;
                        font-size: 1.2rem;
                        cursor: pointer;
                        font-weight: 200;

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
                            border-radius: 8px;
                            position: absolute;
                            top: 0.4rem;
                            left: 2.5rem;
                        }

                        .outline {
                            filter: grayscale(100%);
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
                        padding-left: 1.3rem;
                        height: 5.2rem;

                        a {
                            display: block;
                            width: 100%;
                            height: 100%;
                            color: $color-default;
                        }
                    }

                    > li:hover {
                        /*background-color: #efefef;*/
                    }

                    > li > ul {
                        /*background-color: #ffffff;*/
                    }

                    li.user:hover {
                        /*background-color: #efefef;*/
                    }
                }
            }
        }
    }
</style>
