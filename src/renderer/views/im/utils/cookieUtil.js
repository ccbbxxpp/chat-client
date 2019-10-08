export default {

  setCookies(username,password) {
    window.localStorage.setItem('username', username);
    window.localStorage.setItem('password', password);
  },

  getCookies(param) {
    let loginInfo = window.localStorage.getItem(param);
    if (loginInfo === null) {
      return '';
    } else {
      return loginInfo;
    }
  },

  delWindowsCache(){
    window.localStorage.clear();//清除所有的缓存数据
  }

}