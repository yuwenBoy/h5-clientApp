 import Request from './request'
 import utils from '../utils.js'
 
 var baseUrl = ''
 var NODE_ENV = 'develop'
 
 // #ifdef H5
 const FE_URL = {
 	test: 'yuwenboy.github.io/h5-clientProApp',
 }
 const API_URL = {
 	develop: '127.0.0.1:9000/basic-api',
 	test: '192.168.4.63:9000/basic-api',
	pre:'nest-api-client-19485aq5n-test-client-app.vercel.app/basic-api'
 }  
 
 // 本地开发
 if (location.hostname === '127.0.0.1' || location.hostname === 'localhost') {
 	baseUrl = 'http://' + API_URL.develop
 } else {
 	// 匹配 GitHub Pages
 	let matched = false
 	for (let i in FE_URL) {
 		if (location.href.indexOf(FE_URL[i]) > -1) {
 			NODE_ENV = i
 			// ✅ 关键：HTTPS 页面不能用 HTTP，这里先强制用 http 测试
 			baseUrl = 'http://' + API_URL[i]
 			matched = true
 			break
 		}
 	}
 
 	// ✅ 兜底：如果都没匹配到，使用当前服务器的IP作为API地址
 	if (!matched) {
 		// 使用当前页面的主机地址作为API地址（替换端口）
 		const protocol = location.protocol;
 		const hostname = location.hostname;
 		// 使用后端端口 9000
 		baseUrl = `${protocol}//${hostname}:9000/basic-api`;
 	}
 }
 // #endif
 
 // #ifndef H5
 baseUrl = 'http://192.168.4.63:9000/basic-api'
 // #endif
 
 const test = new Request()
 test.setConfig((config) => {
 	config.baseUrl = baseUrl
 	return config
 })
 
 test.interceptor.request((config, cancel) => {
 	return config
 })
 
 test.validateStatus = (statusCode) => {
 	return statusCode === 200
 }
 
 test.interceptor.response((response) => {
 	return response
 }, (response) => {
 	return response
 })
 
 const http = new Request()
 
 http.setConfig((config) => {
 	config.baseUrl = baseUrl
 	return config
 })
 
 http.validateStatus = (statusCode) => {
 	return statusCode === 200
 }
 
 http.interceptor.request((config, cancel) => {
 	const token = utils.getStorage('token')
 	if (token) {
 		config.header = config.header || {}
 		config.header['Authorization'] =  token
 	}
 	return config
 })
 
 http.interceptor.response((response) => {
 	if (response.data.success === true) {
 		return response.data
 	} else if (Number(response.data.code) === 1002) {
 		if (!response.config.custom.cantNeedLogin) {
 			utils.loginOut()
 			utils.goLogin()
 		}
 		return Promise.reject(response)
 	} else {
 		return Promise.reject(response)
 	}
 }, (response) => {
 	return response
 })
 
 export {
 	http,
 	test,
 	baseUrl,
 	NODE_ENV
 }