<template>
    <div class="im-top" style="-webkit-app-region: drag">
        <a href="javascript:void(0)" @click="close" style="-webkit-app-region: no-drag">
            <Icon type="ios-close" class="text-right"></Icon>
        </a>
        <h1 align="center">图片展示</h1>
        <div style="padding-left: 10px;padding-right: 10px;padding-bottom:20px;overflow-y: scroll;overflow-x: scroll;text-align: center;"
             :style="{height:divHeight +'px'}">
            <img :src="imgHref" align="center"/>
        </div>
    </div>
</template>

<script>
  export default {
    name: 'imgShowWindow',
    data() {
      return {
        // 默认选中的值
        icon: 'ios-square-outline',
        imgHref: '',//打开图片的地址
        divHeight: ''

      };
    },
    created() {
      //创建时拿到图片的地址
      let url = window.location.href;
      let imgUrl = url.substring(url.indexOf('=') + 1);
      imgUrl = imgUrl.replace(/%3A/g, ':');
      imgUrl = imgUrl.replace(/%2F/g, '/');
      this.imgHref = imgUrl;
      this.divHeight = window.innerHeight;
      if (this.divHeight > 1000) {
        this.divHeight = '1000';
      }
    },
    // 创建前状态(里面是操作)
    beforeCreate() {

    },
    methods: {
      close() {
        window.close();
      }
    },
    watch: {},
    computed: {},
    mounted() {
      let self = this;
      // 监听窗口大小
      window.onresize = () => {
        return (() => {
          if (innerHeight > 1000) {
            self.divHeight = 900;
          }
          self.divHeight = innerHeight - 50;
        })();
      };
    }
  };
</script>

<style lang="scss" scoped>
    @import '../../../styles/theme';

    $top-height: 4rem;
    $color-online: #d1ffe9;

    .im-top {
        height: $top-height;
        padding: 0.5rem;
        position: absolute;
        z-index: 2;
        right: 0;
        width: 100%;

        a {
            display: inline-block;
            color: $color-write;
            float: right;

            i {
                color: $color-default;
                font-size: 1.4rem;
                font-weight: bolder;
            }

            :hover {
                background-color: $color-gray;
            }

            .text-right {
                float: right;
                width: 2.4rem;
                height: 2.4rem;
                display: inline-block;
                padding: 0.5rem;
                text-align: center;
            }
        }
    }
</style>
