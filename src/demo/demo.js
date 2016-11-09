import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);
import app from '../App.vue';
import test from './demoTest.vue';
import index from './demoIndex.vue';
const routes = [
  {
    path: '/',
    name: 'index',
    component: index
  },
  {
    path: '/test',
    name: 'test',
    component: test
  },
  // 错误路径重定向到首页
  {
    path: '*',
    redirect: '/'
  }
];
const router = new VueRouter({
  routes
});
new Vue({
  router,
  // components: { app },
  // template: '<app/>'
  render: h => h(app)
}).$mount('#app');
