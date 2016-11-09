/**
 * @file
 * @author 何文林
 * @date 16/11/9
 */
import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);
import App from '../App.vue';
import Register from './register.vue';
import FindPassword from './findPassword.vue';
import ResetPassword from './resetPassword.vue';
const routes = [
  {
    path: '/',
    name: 'Register',
    component: Register
  },
  {
    path: '/FindPassword',
    name: 'FindPassword',
    component: FindPassword
  },
  {
    path: '/ResetPassword',
    name: 'ResetPassword',
    component: ResetPassword
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
  render: h => h(App)
}).$mount('#app');
