	import Router from '../router/index.js'
	// 项目名称
	const PROJECT_NAME = 'jxxqz-h5'
	
	let isLogin = function() {
		if (JSON.stringify(getStorage('token')) !== '{}') {
			return true
		} else {
			return false
		}
	}
	
	// 跳转到登录页面
	let goLogin = function() {
		// #ifdef H5
		location.href = location.origin + location.pathname + '#' + '/pages/user/login'
		// #endif
	
		// #ifdef MP-WEIXIN
		Router.push({
			path: '/pages/user/index/login',
			query: {}
		})
		// #endif
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

// 处理图片URL，替换域名
let processImageUrl = function(url) {
	if (!url) return ''
	return url.replace('image.jxxqz.com', '192.168.124.25')
}

// ==================== 倒计时相关工具 ====================

// 倒计时过期时间（毫秒），默认15分钟
const DEFAULT_EXPIRE_TIME = 15 * 60 * 1000

// 即将过期提醒时间（毫秒），默认5分钟
const WARNING_TIME = 5 * 60 * 1000

// 计算订单过期时间戳
// expireTime: 过期时间戳（秒），createTime: 创建时间戳（秒），expireMinutes: 过期分钟数
let calculateExpireTime = function(expireTime, createTime, expireMinutes = 15) {
	// 优先使用后端返回的过期时间
	if (expireTime) {
		return expireTime * 1000
	}
	// 如果没有，则使用创建时间 + 过期分钟数
	if (createTime) {
		return createTime * 1000 + expireMinutes * 60 * 1000
	}
	// 默认15分钟后过期
	return Date.now() + expireMinutes * 60 * 1000
}

// 格式化倒计时为 MM:SS 或 HH:MM:SS
let formatCountdown = function(remainMs) {
	if (remainMs <= 0) return '00:00'
	
	const totalSeconds = Math.floor(remainMs / 1000)
	const hours = Math.floor(totalSeconds / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60
	
	if (hours > 0) {
		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
	}
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// 判断是否即将过期（低于5分钟）
let isExpiringSoon = function(remainMs) {
	return remainMs > 0 && remainMs <= WARNING_TIME
}

// 判断是否已过期
let isExpired = function(remainMs) {
	return remainMs <= 0
}

// ==================== 网络请求工具 ====================

// 网络错误类型判断
let getNetworkErrorType = function(error) {
	const errMsg = error?.message || error?.errMsg || ''
	
	if (errMsg.includes('timeout') || errMsg.includes('Timeout')) {
		return 'timeout'
	}
	if (errMsg.includes('network') || errMsg.includes('Network') || 
			errMsg.includes('fail') || errMsg.includes('断网') ||
			error?.statusCode === 0) {
		return 'network'
	}
	return 'server'
}

// 显示网络错误提示
let showNetworkError = function(error, duration = 2000) {
	const type = getNetworkErrorType(error)
	const messages = {
		network: '网络连接失败，请检查网络',
		timeout: '请求超时，请稍后重试',
		server: '服务器异常，请稍后重试'
	}
	
	uni.showToast({
		title: messages[type] || '加载失败',
		icon: 'none',
		duration
	})
}

// 通用请求失败处理（带重试次数）
let handleRequestError = function(error, retryCount = 0, maxRetries = 2) {
	const type = getNetworkErrorType(error)
	
	return new Promise((resolve, reject) => {
		// 如果还有重试次数
		if (retryCount < maxRetries) {
			console.log(`请求失败，第 ${retryCount + 1} 次重试...`)
			setTimeout(() => {
				resolve('retry')
			}, 1000 * (retryCount + 1)) // 递增延迟
		} else {
			// 达到最大重试次数，显示错误
			showNetworkError(error)
			reject(error)
		}
	})
}

// 登出函数
let loginOut = function() {
	removeStorage('token')
	removeStorage('userInfo')
	removeStorage('mix')
}

// ==================== 定位相关工具 ====================

// 默认定位坐标（北京）
const DEFAULT_LAT = 39.9042
const DEFAULT_LNG = 116.4074

// 模拟定位数据（用于测试）
const MOCK_LOCATIONS = [
  { lat: 39.9042, lng: 116.4074, name: '北京市朝阳区' },
  { lat: 31.2304, lng: 121.4737, name: '上海市黄浦区' },
  { lat: 23.1291, lng: 113.2644, name: '广州市天河区' },
  { lat: 22.5431, lng: 114.0579, name: '深圳市福田区' }
]

// 检查是否是安全源（HTTPS或localhost）
let isSecureOrigin = function() {
  // #ifdef H5
  const hostname = window.location.hostname
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168.')
  const isHttps = window.location.protocol === 'https:'
  return isLocalhost || isHttps
  // #endif
  // #ifndef H5
  return true
  // #endif
}

// 获取GPS定位
let getGpsLocation = function(callback) {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      callback(null, {
        lat: res.latitude,
        lng: res.longitude
      })
    },
    fail: (err) => {
      console.error('GPS定位失败:', err)
      callback(err, null)
    }
  })
}

// 使用模拟定位（用于测试或定位失败时）
let useMockLocation = function() {
  const randomIndex = Math.floor(Math.random() * MOCK_LOCATIONS.length)
  return MOCK_LOCATIONS[randomIndex]
}

// 获取当前位置信息（封装了多种定位方式）
let getCurrentLocation = function(callback) {
  // 先尝试GPS定位
  getGpsLocation((gpsErr, gpsData) => {
    if (gpsData) {
      callback(null, gpsData)
      return
    }
    
    // GPS失败，使用模拟定位
    const mockData = useMockLocation()
    callback(null, mockData)
  })
}

export default {
	loginOut,
	goLogin,
	isLogin,
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
	processImageUrl,
	// 倒计时工具
	calculateExpireTime,
	formatCountdown,
	isExpiringSoon,
	isExpired,
	DEFAULT_EXPIRE_TIME,
	WARNING_TIME,
	// 网络请求工具
	getNetworkErrorType,
	showNetworkError,
	handleRequestError,
	// 定位工具
	isSecureOrigin,
	getGpsLocation,
	useMockLocation,
	getCurrentLocation,
	DEFAULT_LAT,
	DEFAULT_LNG
}
	
	
