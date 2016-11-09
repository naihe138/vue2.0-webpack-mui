/**
* @file
* @author 何文林
* @date 16/11/8
*/
<template>
  <div id="">
    <h2>{{title}}</h2>
    <test></test>
    <img src="../public/img/man.png" alt="">
    <span class="mui-icon mui-icon-weibo"></span>
    <router-link to="/test">Go to test</router-link>
  </div>
</template>
<style lang="less" rel="stylesheet/less">
  h1 {
    border: 1px solid firebrick;
    padding: 5px;
  }
</style>
<script>
  import test from 'src/public/components/test.vue';
  export default{
    components: {
      test
    },
    data () {
      return {
        title: '这是demo 的标题'
      };
    }
  };
</script>
