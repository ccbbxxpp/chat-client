<template>
    <div class="chat-panel">
        <div class="chat-box-list">
            <Button type="info" style="width: 180px;margin-left: 20px;margin-top: 20px;margin-bottom: 15px">群组列表
            </Button>
            <div class="group-box">
                <ul class="user-list">
                    <li class="user" v-for="chatGroup in chatGroupList"
                        style="border-radius: 10px;margin-bottom: 10px;margin-left: 10px;margin-right: 5px"
                        onmouseover="this.style.backgroundColor='#7D9EC0'"
                        onmouseout="this.style.backgroundColor='#eeeeee'">
                        <a href="javascript:" @dblclick="showChat(chatGroup)" @click="showGroupDetail(chatGroup)">
                            <img :src="[chatGroup.portrait]" style="border-radius: 10px">
                            <b>{{ chatGroup.name }}</b>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <div class="chat-box">
            <Top></Top>
            <div v-if="showGroupDetailDiv" class="chat-box-show-group">
                <div class="chat-box-show-group-title">
                    <h2>群聊详情:</h2>
                </div>
                <!-- 展示群成员 -->
                <div class="chat-box-show-group-show-user">
                    <table>
                        <tr v-for="(count,index) in (Math.ceil(groupUser.length / 8))">
                            <template v-for="item in [...groupUser].splice(index*8,8)">
                                <td>
                                    <img :src="item.portrait">
                                    <p>{{item.displayName.substring(0,7)}}</p>
                                </td>
                            </template>
                            <div v-if="count == (Math.ceil(groupUser.length / 8))">
                                <td>
                                    <img src="static/icon/addUser.png" style="margin-bottom: 15px;">
                                </td>
                                <td v-if="chatGroup.owner == user.userId">
                                    <img src="static/icon/subUser2.png" style="margin-bottom: 15px;">
                                </td>
                            </div>
                        </tr>
                    </table>
                </div>

                <!-- 展示群操作 -->
                <div class="chat-box-show-group-operation">
                    <div class="basic-detail">
                        <p>
                            <b>群聊名称:</b><span style="float: right;color: #f5a623">{{chatGroup.name}}</span>
                        </p>
                        <p>
                            <b>群公告:</b>
                        </p>
                        <p>
                            <B>我在本群的昵称:</B>
                        </p>
                        <p>
                            <B>清空聊天记录</B>
                        </p>
                    </div>
                    <Button style="margin-top: 20px" type="info" long @click="showChat(chatGroup)">发送消息</Button>
                    <Button style="margin-top: 20px;margin-bottom: 20px" v-if="!(chatGroup.owner == user.userId)" type="error" long>删除并退出
                    </Button>
                    <Button style="margin-top: 20px;margin-bottom: 20px" v-if="chatGroup.owner == user.userId" type="error" long>解散并退出</Button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
  import Search from '../components/search.vue';
  import Top from '../components/top.vue';
  import UserChat from '../components/chat.vue';
  import Welcome from '../components/welcome.vue';
  import conf from '../conf';
  import { fetchPost, Chat, ChatListUtils, MessageTargetType } from '../utils/chatUtils';

  export default {
    components: {
      Search,
      Top,
      UserChat,
      Welcome
    },
    computed: {
      //需要展示的用户群组
      chatGroupList: {
        get: function() {
          return this.$store.state.chatGroupList;
        },
        set: function(chatGroupList) {
          this.$store.commit('setChatGroupList', chatGroupList);
        }
      }
    },
    created: function() {
      this.user = this.$store.state.user;
    },
    data() {
      return {
        user: {},
        chatGroup: {},//群组,
        groupUser: {},//群成员
        showGroupDetailDiv: false//是否展示聊天详情
      };
    },
    methods: {
      // 打开一个聊天对话框
      showChat: function(chatGroup) {
        let self = this;
        let chatList = ChatListUtils.getChatList(self.$store.state.user.userId);
        // 删除当前用户已经有的会话
        let newChatList = chatList.filter(function(element) {
          return String(element.id) !== String(chatGroup.groupId);
        });
        // 重新添加会话，放到第一个
        let chat = new Chat(chatGroup.groupId, chatGroup.name, '', chatGroup.portrait, 0, '', '', '', '', MessageTargetType.CHAT_GROUP);
        newChatList.unshift(chat);
        // 存储到localStorage 的 chatList
        ChatListUtils.setChatList(self.$store.state.user.userId, newChatList);
        this.$store.commit('setChatList', newChatList);
        this.$router.push({
          path: '/index/chatBox',
          query: { chat: chat }
        });
      },

      // 展示群组详情
      showGroupDetail(chatGroup) {
        let self = this;
        self.showGroupDetailDiv = true;
        self.chatGroup = chatGroup;
        self.groupUser = chatGroup.groupUser;
      }
    }
  };
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

            .chat-box-show-group {
                margin-top: 50px;
                margin-left: 30px;
                margin-right: 30px;
                overflow-y: scroll;
                overflow-x: scroll;

                .chat-box-show-group-title {
                    margin-bottom: 20px
                }

                .chat-box-show-group-show-user {
                    table {
                        td {
                            width: 75px;
                            margin-right: 25px;

                            img {
                                width: 50px;
                                height: 50px;
                                border-radius: 8px;
                                margin-left: 12.5px;
                                cursor: pointer
                            }

                            p {
                                text-align: center
                            }
                        }
                    }
                }

                .chat-box-show-group-operation {
                    margin-top: 30px;
                    margin-left: 15px;
                    margin-right: 15px;

                    .basic-detail {
                        p {
                            width: auto;
                            height: 40px;
                            font-size: medium;
                            font-style: inherit;
                            padding-top: 8px;
                            border-bottom: 1px solid;
                            border-bottom-color: darkgray;
                            cursor: pointer;
                        }
                    }
                }

            }
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
            margin-bottom: 2rem;

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
        }
    }
</style>
