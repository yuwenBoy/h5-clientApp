	import Router from '../router/index.js'
	// 项目名称
	const PROJECT_NAME = 'haojj'
	
	export function toLogin(){
		// #ifdef MP-WEIXIN
		Router.push({
			path: '/pages/user/login'
		})
		// #endif
		Router.push({name:'login'})
	}
	let isPcFun = function () {
		let isPc = false
		// #ifdef H5
		isPc = (window.navigator.platform.indexOf('Mac') >= 0 || window.navigator.platform.indexOf('Win') >= 0) ? true : false
		// #endif
		return isPc
	}
	// 判断是否在safari浏览器
	let isSafari = function() {
		let isSafari = false
		// #ifdef H5
		isSafari = !isPcFun() ? /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) : false
		// #endif
		return isSafari
	}
	
	//获取rpx upx
	let getPX = function() {
		let px = 'upx'
		// #ifdef MP-WEIXIN
		px = 'rpx'
		// #endif
		return px
	}
	
	
	let getRowAndCol = function(info, isMargin) {
		let str = {
			row: 0, // 行
			col: 0, // 列
			total: null, // 一页多少个
			pages: null, // 一共多少页
			width: null, // 图片的宽度
			height: null, // 图片的高度
			moduleHeight: null, // 模块的高度
			moduleBgColor: '#fffff', // 模块背景色
			modulePadding: '0 0', // 模块的内边距
			moduleRadius: '0 0 0 0'
		}
		if (info.model) {
			let model = info.model.split('x')
			str.row = Number(model[0]) // 行
			str.col = Number(model[1]) // 列
		}
		str.total = str.row * str.col
		// 商品的标题/价格高度
		let titleHeight = 0
		let priceHeight = 0
		let model_padding = 0
		if(info.title == '分类模块'){
			str.moduleBgColor = this.getStorage('pageStyle').default_page_bgcolor
		}
		if (info.is_show_title === '1' || info.is_show_price === '1') {
			str.moduleBgColor = '#ffffff'
			str.modulePadding = '0 20upx'
			model_padding = 40
			str.moduleRadius = '0 0 15upx 15upx'
		}
		if (info.is_show_title === '1') {
			titleHeight = 64
		}
		if (info.is_show_price === '1') {
			priceHeight = 42
		}
		// module_type === '16' model_padding 设置40 模块有个20 * 2的内边距
		if(info && info.module_type === '16') model_padding = 40
		// 设计稿总宽度按照750
		let w = 750
		// 图片的实际宽度 = (w - 左右的margin - 左右的padding - (列数 - 1) * 20) / col列数
		// 图片的实际高度 = 图片的实际宽度 * 宽高比
		// 页面使用要加 upx
		let model_margin = (info.model_margin === '1') ? this.default_module_wide() * 2 : 0
		let colnum = (str.col === 1) ? 0 : str.col - 1
		if (info && info.module_type === '9') {
			str.width = (750 - model_margin - model_padding) / str.col
		} else {
			str.width = (750 - model_margin - model_padding - colnum * 20) / str.col
		}
		str.height = (str.width * info.h_percent) / 100
		// 模块的高度 = 图片的实际高度 * row行数 + (行数 - 1) * 20 + (商品标题占用的高度 64 + 商品价格占用的高度 36) * row行数
		str.moduleHeight = str.height * str.row + (str.row - 1) * 20 + (titleHeight + priceHeight) * str.row
		// console.log(str)
		return str
	}
	
	// 上下间距
	let default_module_high = function() {
		return '20'
	}
	// 左右间距
	let default_module_wide = function() {
		return '20'
	}
	
	//节流
	let lastTime = null
	let throttle = function(fn, t){
		let delay = t || 500
	    return function() {
	       var nowTime = new Date().getTime()
	        if (nowTime - lastTime > delay || !lastTime) {
	            fn.apply(this, arguments) //将this和参数传给原函数
	            lastTime = nowTime
	        }
	    }
	};
	
	// 本地存储信息
	let getStorage = function(name) {
		return uni.getStorageSync(PROJECT_NAME + '_' + name)
	}
	
	let setStorage = function(name, data) {
		uni.setStorageSync(PROJECT_NAME + '_' + name, data)
	}
	
	let removeStorage = function(name) {
		uni.removeStorageSync(PROJECT_NAME + '_' + name)
	}
	
	let toast = function(msg, icon, callBack) {
		// #ifdef H5
		uni.showToast({
			title: msg,
			icon: icon ? icon : 'none',
			image: '',//icon === 'fail' ? 'https://h5.fuduoka.com/statics/img/icon_fail.png' : '',
			complete: (res) => {
				callBack
			}
		})
		// #endif
	
		// #ifdef MP-WEIXIN
		if (msg.length > 25) {
			uni.showModal({
				title: "提示",
				content: msg,
				confirmText: "确定",
				showCancel: false,
				success: (res) => {}
			})
		} else {
			uni.showToast({
				title: msg,
				icon: !icon || (icon === 'fail') ? 'none' : icon,
				complete: (res) => {
					callBack
				}
			})
		}
		// #endif
		return
	}
	
	// 判断用户端是是不是ios系统
	let checkUserSystem = function () {
		const res = uni.getSystemInfoSync()
		let isIos = res.platform === 'ios'
		let isPc = false
		// #ifdef H5
		isPc = (window.navigator.platform.indexOf('Mac')>=0 || window.navigator.platform.indexOf('Win')>=0) ? true : false
		// #endif
		if (isPc) {
			return false
		} else {
			return isIos
		}
	}
	let getRequestData = function(option_data, apiPath) {
		// if (this.getStorage('Token')) {
		// 	option_data.Token = this.getStorage('Token')
		// }
		// option_data = option_data
		// //新加密规则
		// // Md5(Key.substring(0,20) + 接口路径.toLowerCase() +  Params + Key).toLowerCase()
		// //let Sign = md5sum(NOUSEKEY.substring(0,20) + apiPath.toLowerCase() + option_data + NOUSEKEY).toLowerCase()
		// //默认传参
		// let data = {
		// 	Params: option_data,
		// 	Sign: Sign,
		// 	Timestamp: new Date().getTime()
		// }
		return option_data
	}
	
	// 验证工具
	 const isPhone = (phone) => /^1[3-9]\d{9}$/.test(phone);
	 const isCode = (code) => /^\d{6}$/.test(code);

	export default {
		toLogin,
		isSafari,
		getPX,getRowAndCol,
		default_module_high,
		default_module_wide,
		throttle,
		getStorage,
		setStorage,
		removeStorage,
		toast,
		checkUserSystem,
		getRequestData,
		isPhone,
		isCode,
	}
	
	
