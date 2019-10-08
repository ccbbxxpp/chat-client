export default {


  // html特俗字符转码
  htmlDecodeByRegExp: function(str) {
    var s = '';
    if (str.length == 0) return '';
    s = str
      .replace(/&amp;/g, '=')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, '\'')
      .replace(/&quot;/g, '\"');
    return s;
  }
};