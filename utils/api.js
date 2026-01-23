import {baseUrl} from './luch-request_1.0.6/index.js'
import { request } from './luch-request_1.0.6/request.js';

// 首页
const index = {
	pms_index: '/app/Index/pms_index', // 首页
	test:'/auth/test'
}



// 用户相关接口
const user = {
  // 发送短信验证码
 sendSmsCode:'/client/user/sendCode',
  // 手机号登录
 loginByPhone:'/client/user/login',
 // 微信登录
 wxLogin:'/auth/login/wechat' 
};


export default ({
	index,
	user,
})