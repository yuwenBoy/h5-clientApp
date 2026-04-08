// 首页
const index = {
	pms_index: '/app/Index/pms_index', // 首页
	test:'/auth/test',
	storeList:'/client/home/storeList', // 门店列表接口
	storeDetail:'/client/home/storeDetail', // 门店详情
}

// 商品相关接口
const goods = {
	detail:'/client/goods/detail', // 商品详情
	addToCart:'/client/cart/add', // 加入购物车
	cartList:'/client/cart/list', // 购物车列表
	cartUpdate:'/client/cart/update', // 更新购物车
	cartDelete:'/client/cart/delete', // 删除购物车
	cartClear:'/client/cart/clear', // 清空购物车
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
 // 获取用户下单默认地址
 defaultAddress:'/client/address/defaultAddress',
}

// 订单相关接口
const order = {
	// 创建订单
	create:'/client/order/create',
	// 订单列表
	list:'/client/order/list',
	// 订单详情
	detail:'/client/order/detail',
	// 订单取消
	cancel:'/client/order/cancel',
	// 订单支付
	pay:'/client/order/pay',
}

// 支付相关接口
const pay = {
	unified:'/client/pay/unified'
}

// 公共api接口
const common = {
	// 获取三级城市
	chinaRegions:'/client/user/chinaRegions',
}


export default ({
	index,
	goods,
	user,
	order,
	pay,
	common,
})