class MessageUtil {
  /**
   *
   * @param username    消息来源用户名
   * @param avatar      发送者头像
   * @param id          消息的来源ID（如果是私聊，则是用户id，如果是群聊，则是群组id）
   * @param type        消息类型 0:一对一的会话类型  1:群组会话类型 2:聊天室会话类型，
   * @param content     消息内容
   * @param mine        是否被人发送
   * @param fromid      消息的发送者id
   * @param timestamp   服务端时间戳毫秒数
   * @param length      扩展参数
   * @param msgType     消息内容类型 img video text file
   * @param msgId       消息ID
   */
  constructor(username, avatar, id, type, content, mine, fromid, timestamp, length, msgType, msgId) {
    this.username = username;
    this.avatar = avatar;
    this.id = id;
    this.type = type;
    this.content = content;
    this.mine = mine;
    this.fromid = fromid;
    this.timestamp = timestamp;
    this.length = length;
    this.msgType = msgType;
    this.msgId = msgId;
  }

  // 转发消息到mqtt
  sendMsg(message) {
    let url = 'http://127.0.0.1:9999/message/send';
    fetch(url, {
      method: 'POST',
      model: 'cros', //跨域
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    }).then(response => {

    });
  }


}

export default MessageUtil;