<script>
  import conf from '../conf';
  import paste from '../utils/paste.js';
  import { getCursorPosition, setCursorPosition } from '../utils/cursorPosition.js';
  import { formUpload } from '../utils/chatUtils';

  export default {
    props: ['value'],
    name: 'chatInput',
    data() {
      return {
        editor: null,
        cursorPosition: 0,
        content: this.value
      };
    },
    mounted() {
      this.editor = this.$refs['editor'];
      const el = this.$refs['editor'];
      // 监听中文输入
      el.addEventListener('compositionstart', this.onCompositionstart, false);
      el.addEventListener('compositionend', this.onCompositionend, false);
    },
    watch: {
      value(newvalue) {
        if (!newvalue) {
          // 清空节点内所有html来清空文本
          this.$refs.editor.innerHTML = '';
        } else {
          if (newvalue.indexOf('<img class=') !== -1 || newvalue.indexOf('face[') !== -1 ||
            newvalue.indexOf('file(http://') !== -1 || newvalue.indexOf('http://') !== -1) {//包含表情和图片时把光标移动到最后
            this.$refs.editor.innerHTML = newvalue;
            this.keepLastIndex(this.$refs.editor);
          }
          // 如果是pc的话，timeout设置为5就好，ios经测试，使用40才有效果
          /* const timeout = 5;
           setTimeout(() => {
               this.keepLastIndex(this.$refs.editor);
           }, timeout);*/
        }
      }
    },
    methods: {
      onCompositionstart(e) {
        this.isLock = true;
      },
      onCompositionend(e) {
        this.isLock = false;
      },
      changeText(e) {
        // 解决中文输入的时候，直接输出英文字母的问题(中文输入期间，不允许输入字符)
        setTimeout(() => {
          if (this.isLock) return;
          let value = e.target.innerHTML;
          // 去除换行符
          value = value.replace(/(\<\/?\w*\>)/g, '').replace(/(\r\n)|(\n)/g, '');
          this.$emit('input', value);
        }, 0);
      },
      submit(e) {
        this.$emit('returnMsg', this.$el.innerHTML);
        this.$emit('sendMsg');
        const value = this.$el.innerHTML.replace(/[\n\r]$/, '');
        if (value) {
          this.$el.innerText = '';
        }
      },
      async onPaste(e) {
        let self = this;
        const result = await paste(e);
        const imgRegx = /^data:image\/png;base64,/;
        if (imgRegx.test(result)) {
          let param = new FormData();
          let bytes = window.atob(result.split(',')[1]);
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
                /*
                 document.execCommand('insertImage', false, json.filePath);
               */
                let html = '<img class=\'message-img\'  src=\'' + json.filePath + '\' alt=\'\' />';
                self.$el.innerHTML += html;
                self.keepLastIndex(self.$refs.editor);
              }
            },
            self
          );
        } else {
          document.execCommand('insertText', false, result);
        }
      },
      getCursor() {
        this.cursorPosition = getCursorPosition(this.editor);
      },
      keepLastIndex(el) {
        if (window.getSelection) {
          el.focus();
          const sel = getSelection();
          sel.selectAllChildren(el);
          sel.collapseToEnd();
        } else if (document.selection) {
          var range = document.selection.createRange();// 创建选择对象
          range.moveToElementText(el);// range定位到el
          range.collapse(false);// 光标移至最后
          range.select();
        }
      }
    },
    beforeDestroy() {
      // 清除监听中文输入
      const el = this.$refs.input;
      //el.removeEventListener('compositionstart', this.onCompositionstart, false);
      //el.removeEventListener('compositionend', this.onCompositionend, false);
    }
  };
</script>

<style scoped>
    .editor {
        /*width: 500px;*/
        height: 180px;
        /*border-radius: 4px;*/
        background: #fff;
        /*border: 1px solid #ccc;*/
        box-sizing: border-box;
        overflow: scroll;
        word-break: break-all;
        overflow-wrap: break-word;
        padding: 5px;
        outline: none;
    }
</style>
<template>
    <div
            class="editor"
            contenteditable="true"
            ref="editor"
            @input="changeText"
            @keyup="getCursor"
            @keydown.enter.prevent="submit"
            @paste.prevent="onPaste"
            @click="getCursor">
    </div>
</template>
