import Request from './request'
import utils from '../utils.js'

// 判断运行环境配置接口地址 接口协议为当前访问页面协议
var baseUrl = ''
var NODE_ENV = 'develop'
// #ifdef H5
// 运行环境配置
const FE_URL = {
	'product': 'h5.fuduoka.com/fuduoduo',
	'pre': 'pre.h5.fuduoka.com/fuduoduo',
	'test': 'h5.cm.test.fuduoka.com:17004/fuduoduo',
	'develop': 'h5.test.fuduoka.com:17004/fuduoduo',// h5.test.fuduoka.com:17004/fuduoduo
	'ronghua': 'pre.h5.fuduoka.com/ronghua',
	'zhouya': 'pre.h5.fuduoka.com/zhouya',
}
const API_URL = {
	'develop': '//192.168.4.63:9000/basic-api', // api.front.wujie.develop.fuduoka.com:17004
}
// 本地
if (location.hostname === '127.0.0.1' || location.hostname === '192.168.4.63') {
	baseUrl = 'http://' + API_URL[NODE_ENV]
} else {
	// 非本地
	for (let i in FE_URL) {
		if (location.href.indexOf(FE_URL[i]) > -1) {
			NODE_ENV = i
			baseUrl = location.protocol + '//' + API_URL[i]
		}
	}
}
// #endif

// #ifndef H5
switch (NODE_ENV) {
	case 'test':
		baseUrl = 'https://xinwei.fuli.qqjiazu.cn'
		break
	case 'develop':
		baseUrl = 'https://xinwei.fuli.qqjiazu.cn'
		break
	case 'pre':
		baseUrl = 'https://pre.api.app.fuduoka.com'
		break
	case 'product':
		baseUrl = 'https://api.app.fuduoka.com'
		break
}
// #endif

const test = new Request()
test.setConfig((config) => { /* 设置全局配置 */
	config.baseUrl = baseUrl
	config.header = {
		...config.header,
	}
	return config
})

test.interceptor.request((config, cancel) => { /* 请求之前拦截器 */
	config.header = {
		...config.header,
	}
	return config
})

test.validateStatus = (statusCode) => {
	return statusCode === 200
}

test.interceptor.response((response) => { /* 请求之后拦截器 */
	return response
}, (response) => { // 请求错误做点什么
	return response
})

const http = new Request()

http.setConfig((config) => { /* 设置全局配置 */
	config.baseUrl = baseUrl
	config.header = {
		...config.header,
	}
	return config
})

http.validateStatus = (statusCode) => {
	return statusCode === 200
}

http.interceptor.request((config, cancel) => { /* 请求之前拦截器 */
	config.header = {
		...config.header,
	}
	return config
})

http.interceptor.response((response) => {
	/* 请求之后拦截器 */
	if (response.data.success === true) { // 服务端返回的success等于true，则成功
		return response.data
	} else if (Number(response.data.code) === 1002) {
		// cantNeedLogin: true 不需要弹出登录
		if (response.config.custom.cantNeedLogin){
			return Promise.reject(response)
		} else {
			// 退出登录
			// #ifdef H5
			utils.loginOut(true)
			// #endif
			// #ifdef MP-WEIXIN
			utils.clearLoginStorage()
			// #endif
			utils.goLogin()
		}
	} else {
		return Promise.reject(response)
	}
}, (response) => { // 请求错误做点什么
	return response
})

export {
	http,
	test,
	baseUrl,
	NODE_ENV
}
