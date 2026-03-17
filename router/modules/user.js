const user = [
{
	path: '/pages/user/user',
	name: 'user',
	meta: {
		title: '我的'
	}
},{
	path: '/pages/user/about',
	name: 'about',
	meta: {
		title: '关于号家军'
	}
},{
	path: '/pages/user/address/list',
	name: 'address',
	meta: {
		title: '我的收货地址',
	  requireLogin: true
	}
},{
	path: '/pages/user/address/edit',
	name: 'address',
	meta: {
		title: '新增地址'
	}
},{
	path: '/pages/user/login',
	name: 'login',
	meta: {
		title: '登录'
	}
},{
	path: '/pages/user/register',
	name: 'register',
	meta: {
		title: '注册'
	}
},{
	path: '/pages/user/bindPhone',
	name: 'bindPhone',
	meta: {
		title: '绑定手机号'
	}
},{
	path: '/pages/user/order',
	name: 'order',
	meta: {
		title: '我的订单'
	}
}]
export default user
