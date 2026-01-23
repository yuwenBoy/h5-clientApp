import modules from './modules';
import Vue from 'vue'
import Router from 'uni-simple-router';
Vue.use(Router)
//初始化
const router = new Router({
	routes: [...modules] //路由表
});

// // 全局路由前置守卫
// router.beforeEach((to,from,next)=>{
// 	console.log(to);
// 	console.log(from);
// 	console.log(next)
// 	next();
// })
export default router;