import utils from './utils.js'
const musicPlay = uni.createInnerAudioContext()
let isPlay = false, // 默认播放
	flag = false // 判断是否播放过
console.log('music.js')

const music = {
	// 播放
	play() {
		musicPlay.play()
		isPlay = true
	},
	// 暂停
	pause() {
		musicPlay.pause()
		isPlay = false
	},
	// 获取播放状态
	getPlay() {
		return isPlay
	},
	// 初始化请求完接口执行播放
	init() {
		console.log('init方法')
		let musicPath = utils.getStorage('bg_music') || 'https:\/\/img.app.fuduoka.com\/upload\/source\/202112\/23\/1640252618953890.mp3'
		if (musicPath) {
			if (!flag) {
				flag = true
				musicPlay.autoplay = false // 自动播放
				musicPlay.loop = true // 循环播放
				musicPlay.src = musicPath
				musicPlay.onPlay(() => {
					console.log('开始播放');
				})
			}
		} else {
			musicPlay.pause()
		}
	},
}
export default {
	music
}
