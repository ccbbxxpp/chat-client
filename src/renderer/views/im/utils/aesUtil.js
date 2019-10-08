import CryptoJS from 'crypto-js/crypto-js';

// 默认的 KEY 与 iv 如果没有给
const KEY = CryptoJS.enc.Utf8.parse('n8.@!qnj;;//*&^@');
const IV = CryptoJS.enc.Utf8.parse('n8.@!qnj;;//*&^@');

export default {
  /**
   * AES加密 ：字符串 key iv  返回base64
   */
  Encrypt(word, keyStr, ivStr) {
    let key = KEY;
    let iv = IV;

    if (keyStr) {
      key = CryptoJS.enc.Utf8.parse(keyStr);
      iv = CryptoJS.enc.Utf8.parse(ivStr);
    }

    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7 });
    return encrypted.ciphertext.toString().toUpperCase();
  },
  /**
   * AES 解密 ：字符串 key iv  返回base64
   *
   */
  Decrypt(word, keyStr, ivStr) {
    let key = KEY;
    let iv = IV;

    if (keyStr) {
      key = CryptoJS.enc.Utf8.parse(keyStr);
      iv = CryptoJS.enc.Utf8.parse(ivStr);
    }

    let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let decrypt = CryptoJS.AES.decrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7 });
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
  }
};


