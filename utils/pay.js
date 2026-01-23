export default {  
	mpWx: function (data) {
		return new Promise(function (resolve, reject) {
			uni.requestPayment({
				provider: 'wxpay',
				timeStamp: data.timeStamp,
				nonceStr: data.nonceStr,
				package: data.package,
				signType: data.signType,
				paySign: data.paySign,
				success: function (res) {
					console.log('success:' + JSON.stringify(res))
					resolve(res)
				},
				fail: function (err) {
					console.log('fail:' + JSON.stringify(err))
					reject(err)
				}
			})
		})
	}
}