import Vue from 'vue'
import App from './App'
import './static/css/main.less'
import './static/css/module.scss'
import { RouterMount } from 'uni-simple-router'
import { http } from 'utils/luch-request_1.0.6/index.js' // 全局挂载引入，配置相关在该index.js文件里修改
import router from './router'
import utils from './utils/utils.js'
import apis from './utils/api'
import pay from './utils/pay'
import music from 'utils/music.js'
Vue.prototype.$serverUrl = 'https://unidemo.dcloud.net.cn';

Vue.prototype.$request = http
Vue.prototype.$utils=utils;
Vue.prototype.$apis=apis;
Vue.prototype.$pay=pay;
Vue.prototype.$music = music;
Vue.config.productionTip = false
//引入全局通用组件
import MescrollUni from "@/components/mescroll-uni/mescroll-uni.vue"
Vue.component('mescroll-uni', MescrollUni)
App.mpType = 'app'
const app = new Vue({
    ...App
})
//v1.3.5起 H5端 你应该去除原有的app.$mount();使用路由自带的渲染方式
// #ifdef H5
	RouterMount(app,'#app')
// #endif

// #ifndef H5
	app.$mount(); //为了兼容小程序及app端必须这样写才有效果
// #endif
