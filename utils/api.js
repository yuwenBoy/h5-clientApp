import {baseUrl} from './luch-request_1.0.6/index.js'
import { request } from './luch-request_1.0.6/request.js';

// 首页
const index = {
	pms_index: '/app/Index/pms_index', // 首页
	test:'/auth/test',
	storeList:'/client/home/storeList', // 门店列表接口
}



// 用户相关接口
const user = {
  // 发送短信验证码
 sendSmsCode:'/client/user/sendCode',
  // 手机号登录
 loginByPhone:'/client/user/login',
 // 获取地址详情
 getAddressDetail:'/client/address/detail',
 // 编辑地址
 editAddress:'/client/address/edit',
 // 新增地址
 addAddress:'/client/address/add',
 // 获取地址列表
 getAddressList:'/client/address/list',
 // 设置默认地址
 setDefaultAddress:'/client/address/setDefaultAddress',
 // 删除地址
 deleteAddress:'/client/address/deleteAddress',
}

// 公共api接口
const common = {
	// 获取三级城市
	chinaRegions:'/client/user/chinaRegions',
}


export default ({
	index,
	user,
	common,
})