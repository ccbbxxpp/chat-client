<template>
    <div class="friend-box">
        <div class="friend-box-list">
            <div class="friend-box-list-title">
                <h2 align="center">新的朋友</h2>
            </div>
            <div class="add-friends">
                <Input class="add-friends-input" type="text" placeholder="请输入用户账号"
                       v-model="friendsName"></Input>
                <Button type="info" @click="searchUser">搜索</Button>
                <div v-if="showUser" style="margin: 0 1rem;">
                    <ul v-for="friend in friendsList">
                        <li onmouseover="this.style.backgroundColor='#7D9EC0'"
                            onmouseout="this.style.backgroundColor='#eeeeee'">
                            <img :src='[host + friend.avatar]'>
                            <b style=" ">{{ friend.name }}</b>
                            <div style="float: right;padding-right: 10px;text-align: center">
                                <Button type="success" @click="modal1=true,friendId = friend.id"
                                        style="margin-bottom: 5px;margin-top: 13px">
                                    添加
                                </Button>
                            </div>
                        </li>
                    </ul>
                </div>
                <div v-if="showAddUserMsg">
                    <h2 align="center" style="color: #e13d13">用户不存在</h2>
                </div>
            </div>

            <div class="group-box" v-if="true">
                <div style="margin-left: 10px;color: #ff9900" v-if="requestFriendsList.length>0">
                    <h3>好友请求</h3>
                </div>
                <ul class="group-list">
                    <ul class="userList" v-for="friend in requestFriendsList">
                        <li class="user" style="border-bottom:1px dashed;border-radius: 10px;height: 65px;"
                            onmouseover="this.style.backgroundColor='#7D9EC0'"
                            onmouseout="this.style.backgroundColor='#eeeeee'">
                            <div>
                                <img :src="host + friend.avatar"
                                     style="width: 45px;height: 45px">
                                <b>{{friend.username}}</b>
                                <p>{{friend.content}}</p>
                            </div>
                            <div style="float: right;padding-right: 10px">
                                <Button type="success" size="small" @click="agreeFriendRequest(friend.fromid)"
                                        style="float: top;margin-bottom: 5px;margin-top: 5px">接受
                                </Button>
                                <br/>
                                <Button type="error" size="small" @click="delFriendRequest(friend.fromid)"
                                        style="float: bottom">忽略
                                </Button>
                            </div>
                        </li>
                    </ul>
                </ul>
            </div>
        </div>

        <Modal footer-hide closable v-model="modal1" title="验证消息" width="300">
            <textarea type="text" v-model="verMsg" placeholder="请输入验证消息"
                      style="height: 50px;width: 200px;margin-left: 33px"></textarea>
            <br/>
            <Button type="success" @click="sendFriendRequest()"
                    long style="margin-bottom: 5px;margin-top: 13px">
                发送
            </Button>
        </Modal>
        <div class="chat-box">
            <Top></Top>
            <Welcome></Welcome>
        </div>
    </div>
</template>

<script>
  import Top from '../components/top.vue';
  import Welcome from '../components/welcome.vue';
  import conf from '../conf';

  export default {
    name: 'friendsBox',
    // 模块数据
    data() {
      return {
        host: conf.getHostUrl(),
        friendsName: '',//用户账号
        friendsList: [],//根据用户账号查询到的用户数据
        showUser: true,//是否展示搜索到的user
        showAddUserMsg: false,//是否展示添加好友的返回信息
        modal1: false,
        friendId: '',//好友Id
        verMsg: ''//验证消息

      };
    },
    // 注册组件
    components: {
      Top,
      Welcome
    },
    methods: {
      //搜索用户
      searchUser: function() {
        let self = this;
        let friendsName = this.friendsName;
        if (friendsName == '' || friendsName == null) {
          self.$Message.error('用户账号不能为空');
          this.friendsList = null;
          return;
        }
        if (!/^[A-Za-z0-9]+$/.test(friendsName)) {
          self.$Message.error('用户账号为数字或英文字母！');
          this.friendsList = null;
          return;
        }
        //let url = 'http://localhost:8080/friends/search-friends';
        let url = conf.getSearchFriendsUrl();
        let param = new FormData();
        let token = sessionStorage.getItem('token');
        param.set('access_token', token);
        param.set('friendsName', friendsName);
        fetch(url, {
          method: 'POST',
          model: 'cros', //跨域
          headers: {
            Accept: 'application/json'
          },
          body: param
        }).then(response => response.json())
          .then(json => {
            let userList = json;
            if (userList.length == 0 || userList == null) {
              self.showAddUserMsg = true;
              this.friendsList = null;
            } else {
              self.showAddUserMsg = false;
              this.friendsList = userList;
            }
          });
      },
      /**
       * 发送好友请求
       */
      sendFriendRequest: function() {
        let self = this;
        let userId = self.$store.state.user.id;
        let content = self.verMsg;
        if (content.length > 10) {
          this.$Message.error('验证消息不能超过10个字符');
          return;
        }
        //let url = 'http://localhost:8080/friends/send-add-friend-request';
        let url = conf.getSendAddFriendRequest_url();
        let param = new FormData();
        let token = sessionStorage.getItem('token');
        param.set('access_token', token);
        param.set('userId', userId);
        param.set('friendId', this.friendId);
        param.set('content', content);
        fetch(url, {
          method: 'POST',
          model: 'cros', //跨域
          headers: {
            Accept: 'application/json'
          },
          body: param
        }).then(response => response.json())
          .then(json => {
            let code = json.code;
            let msg = json.msg;
            if (code === 'error') {
              this.$Message.error(msg);
            } else {
              this.$Message.success({
                content: msg,
                duration: 2
              });
            }
            this.modal1 = false;
          });
      },
      //删除好友请求
      delFriendRequest: function(id) {
        let self = this;
        let resuestFriendsList = self.$store.state.requestFriendsList;
        for (let i = 0; i < resuestFriendsList.length; i++) {
          let friend = resuestFriendsList[i];
          let friendId = friend.fromid;//内存中的好友Id
          if (id === friendId) {
            resuestFriendsList.splice(i, 1);
            self.$store.commit('setFriendsList', resuestFriendsList);
            return;
          }
        }
      },
      //通过好友申请
      agreeFriendRequest: function(id) {
        let self = this;
        //let url = 'http://localhost:8080/friends/add-friends';
        let url = conf.getNewFriendUrl();
        let userId = self.$store.state.user.id;
        let token = sessionStorage.getItem('token');
        let param = new FormData();
        param.set('access_token', token);
        param.set('userId', userId);
        param.set('friendId', id);
        fetch(url, {
          method: 'POST',
          model: 'cros', //跨域
          headers: {
            Accept: 'application/json'
          },
          body: param
        }).then(response => response.json())
          .then(json => {
            //添加成功后刷新好友列表
            let url = conf.getFriendAndGroup();
            fetch(url, {
              method: 'POST',
              model: 'cros', //跨域
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                'userId': userId
              })
            })
              .then(response => response.json())
              .then(json => {
                const friends = json.friends;
                const groups = json.groups;
                this.$store.commit('setUserFriendList', friends);
                this.$store.commit('setChatGroupList', groups);
              });
          });
        //添加成功后把对方从申请列表中移除
        let resuestFriendsList = self.$store.state.requestFriendsList;
        for (let i = 0; i < resuestFriendsList.length; i++) {
          let friend = resuestFriendsList[i];
          let friendId = friend.fromid;//内存中的好友Id
          if (id === friendId) {
            resuestFriendsList.splice(i, 1);
            self.$store.commit('setFriendsList', resuestFriendsList);
          }
        }
      }
    },
    // 监听指定值，只有指定值变化，才会触发
    watch: {},
    // 里面的函数只有调用才会执行（实时计算）里面是定义的方法
    // 创建完毕状态(里面是操作)
    created() {
    },
    computed: {
      requestFriendsList: {
        get: function() {
          let list = this.$store.state.requestFriendsList;
          let newList = [];
          for (let i = list.length - 1; i >= 0; i--) {
            newList.push(list[i]);
          }
          return newList;
        },
        set: function(requestFriendsList) {
          this.$store.commit('setAddFriendsList', requestFriendsList);
        }
      }
    },
    // 创建前状态(里面是操作)
    beforeCreate() {
    },
    // 挂载前状态(里面是操作)
    beforeMount() {
    },
    // 挂载结束状态(里面是操作)
    mounted() {
    },
    // 更新前状态(里面是操作)
    beforeUpdate() {
    },
    // 更新完成状态(里面是操作)
    updated() {
    },
    // 销毁前状态(里面是操作)
    beforeDestroy() {
    },
    // 销毁完成状态(里面是操作)
    destroyed() {
    }
  };
</script>

<style lang="scss" scoped>
    @import '../../../styles/theme';

    .ivu-tabs-content {
        height: 100%;
    }

    .friend-box {
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

        .friend-box-list {
            height: 100%;
            width: 22rem;
            display: flex;
            flex-direction: column;

            .friend-box-list-title {
                height: 40px;
                margin-top: 20px;
                border-bottom-style: solid;
                border-width: 1px;
                color: black
            }

            .add-friends {
                margin-bottom: 20px;

                .add-friends-input {
                    border: 3px;
                    margin-top: 10px;
                    margin-bottom: 10px;
                    margin-left: 10px;
                    margin-right: 8px;
                    width: 130px
                }

                ul {
                    li {
                        border-radius: 10px;
                        height: 58px;
                        list-style: none;
                        position: relative;
                        font-size: 1.2rem;
                        font-weight: 200;

                        img {
                            width: 45px;
                            height: 45px;
                            width: 4.4rem;
                            height: 4.4rem;
                            border-radius: 50%;
                            position: absolute;
                            top: 0.8rem;
                            left: 1.2rem;
                        }

                        b {
                            position: absolute;
                            font-size: 1.3rem;
                            left: 6.0rem;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            font-weight: 600;
                            top: 2.1rem;
                        }
                    }
                }
            }

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
                        border-radius: 50%;
                        position: absolute;
                        top: 0.8rem;
                        left: 1.2rem;
                    }

                    .outline {
                        filter: grayscale(100%);
                    }

                    b {
                        position: absolute;
                        font-size: 1.3rem;
                        left: 6.0rem;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        font-weight: 600;
                        top: 0.6rem;
                    }

                    p {
                        position: absolute;
                        left: 6.0rem;
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

            }
        }
    }

</style>
