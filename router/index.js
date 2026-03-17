import modules from './modules';
import Vue from 'vue'
import Router from 'uni-simple-router';
import utils from '../utils/utils.js'
Vue.use(Router)
//初始化
const router = new Router({
	routes: [...modules] //路由表
});

// 全局路由前置守卫
router.beforeEach((to,from,next)=>{
 // 判断是否登录
 	if (to.meta && to.meta.requireLogin && !utils.isLogin()) {
 		// 将登录后的回跳地址存在本地
 		utils.setStorage('closeLoginToPage', from)
 		utils.setStorage('loginSuccessToPage', to.path)
 		utils.setStorage('goodsQuery', to.query)
 		// #ifdef H5
 		utils.goLogin()
 		// #endif
 	} else {
 		next()
 	}
})
export default router;