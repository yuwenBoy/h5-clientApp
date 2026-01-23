<template>
	<scroll-view scroll-y @scroll="onscroll">
		<!-- #ifdef MP-WEIXIN -->
		<nav-bar :scroll-top="scrollTop" :showBack="false" type="white" title="号家军家校沟通平台"></nav-bar>
		<!-- #endif -->
		<view class="home" v-for="item in pageList" :key="item.id">
			<view class="banner">
				<swiper-module :item_data="item"></swiper-module>
			</view>
			<view class="nav-menu flex center align flex-wrap">
				<view class="column" v-for="cItem in titleList" :key="cItem.id" @click="toPage(cItem.router)">
					<image :src="cItem.url"></image>
					<view>{{ cItem.name }}</view>
					<view v-if="cItem.name === '家校消息'" class="msg"></view>
				</view>
			</view>
			<view class="new-list">
				<view class="title fs32 borderb"><text class="top-line"></text>最新消息</view>
				<view class="new-list-item borderb">
					<image src="https://jiaoyu.xianmxkj.com/file/uploadPath/2023/03/10/08dbda7a854946759959e87e306f09c8.png">
					</image>
					<view class="desc fs32">号家军成都分舵 家长坛会 <br />毛辉老师明天晚上7:30给大家做网络专题分享，欢迎各位家长欢迎收听</view>
				</view>
			</view>
		</view>
	</scroll-view>
</template>

<script>
	import MescrollMixin from "@/components/mescroll-uni/mescroll-mixins.js"
	import SwiperModule from '@/components/swiper-module/swiper-module.vue'
	import NavBar from '@/components/nav-bar/nav-bar.vue'
	export default {
		mixins: [MescrollMixin],
		data() {
			return {
				titleList: [{
					id: 1,
					name: '我的班级',
					url: '../../static/img/home/myclass.png',
					router: '/pages/home/myclass',
				}, {
					id: 2,
					name: '我的课堂',
					url: '../../static/img/home/myclassroom.png',
					router: '/pages/home/myclassroom',
				}, {
					id: 3,
					name: '我的作业',
					url: '../../static/img/home/myzuoye.png',
					router: '/pages/home/myzuoye',
				}, {
					id: 4,
					name: '我的课时',
					url: '../../static/img/home/myclasshour.png',
					router: '/pages/home/myclasshour',
				}, {
					id: 5,
					name: '家校消息',
					url: '../../static/img/home/message.png',
					router: '/pages/home/message',
				}, {
					id: 6,
					name: '学生缴费',
					url: '../../static/img/home/pay.png',
					router: '/pages/home/quickzf',
				}],
				pageList: [{
					"id": 1,
					"model": "1x1",
					"h_percent": "30",
					"items": [{
							"id": "15076",
							"image": "../../static/img/home/banner.png",
							"image_width": "0",
							"url": "welfare:\/\/wangpiao.com\/webview?title=&url=https%3A%2F%2Fh5.fuduoka.com%2Ffuduoduo%2F%23%2Fpages%2Fspecial%2Fhome%3Fquery%3D%257B%2522id%2522%253A%2522351.html%2522%257D"
						},
						{
							"id": "14658",
							"image": "../../static/img/home/banner.png",
							"image_width": "0",
							"url": "welfare:\/\/wangpiao.com\/goods\/detail?id=379028"
						}
					]
				}],
				isRequest: false,
				scrollTop: 0, //实时监听滚动距离顶部位置
			}
		},
		// 分享
		onShareAppMessage(res) {
			return {
				title: '福多多福利',
				path: 'pages/home/home'
			}
		},
		// 分享朋友圈
		onShareTimeline() {
			return {
				title: '福多多福利',
				query: '',
				path: 'pages/home/home',
				imageUrl: 'https://img.app.fuduoka.com/upload/source/202010/27/1603765641363145.jpg'
			}
		},
		onLoad() {
			// #ifdef MP-WEIXIN
			this.bg_top = uni.getMenuButtonBoundingClientRect().height * 2 + uni.getMenuButtonBoundingClientRect().top *
				2 + 12
			// #endif
			// this.$utils.removeStorage('palt_router_name')
			// this.init()
			// this.$utils.getMyLocation((addressinfo,isSelCity)=>{
			// 	let currentcity = this.$utils.getStorage('currentcity')
			// 	this.cityItem = currentcity.short_name ? currentcity : this.$utils.defAddress()
			// 	this.$utils.cityModalTips(this.cityItem).then((city_name) => {
			// 		this.cityItem = {
			// 			short_name: city_name
			// 		}
			// 		this.init()
			// 	})
			// 	// if(isSelCity){
			// 	// 	setTimeout(()=>{
			// 	// 		this.$refs.search[0].selectCity()
			// 	// 	},100)
			// 	// }
			// })
			// this.$utils.cancelMovieOrder(this)
		},
		onShow() {
			// // #ifdef H5
			// // 如果没有登录 且地址栏有code 则需要登录
			// if (!this.$utils.isLogin() && this.$wechat.isWechat() && this.$utils.getQueryVariable('code')) {
			// 	this.$utils.mpLogin(this.$utils.getQueryVariable('code'))
			// }
			// // #endif
			// 获取定位
			// let currentcity = this.$utils.getStorage('currentcity')
			// this.cityItem = currentcity.short_name ? currentcity : this.$utils.defAddress()
			// // 退出登录后城市信息恢复默认，则应该刷新页面
			// if (this.$utils.getStorage('relaodHome')) {
			// 	this.$utils.removeStorage('relaodHome')
			// 	this.init()
			// }
			// // #ifdef MP-WEIXIN
			// if (!this.$utils.isLogin()) {
			// 	this.$utils.setStorage('closeLoginToPage', this.$Route)
			// }
			// // #endif
		},
		methods: {
			// 监听页面滚动
			onscroll(e) {
				this.scrollTop = e.detail.scrollTop
			},
			// 页面跳转
			toPage(route) {
				console.log(route)
				if (route) {
					this.$Router.push({
						path: route
					})
				}
			},
		},
		mounted(){
			console.log(123)
			this.$request.post(this.$apis.index.test,{id:1}).then((data)=>{
				console.log(data)
			}).catch((err)=>{
				console.log(err);
				// this.$utils.toast(err.msg)
			})
		},
		components: {
			SwiperModule,
			NavBar,
		}
	}
</script>

<style lang="less" scoped>
	.home {
		height: 100vh;

		.banner {
			background: linear-gradient(to bottom, #03A9F4, #00BCD4);
			width: 100%;
			// height: 376upx;
			background-size: 100% auto;
		}

		.nav-menu {
			margin: 0 20upx 20upx;
			background-color: #FFFFFF;
			border-radius: 16rpx;
			padding: 20upx 0;

			.column {
				width: calc(100vw / 4);
				margin: 20upx auto;
				text-align: center;
        position: relative;
				image {
					width: 96upx;
					height: 96upx;
				}
				.msg{
					position: absolute;
					width: 20upx;
					height: 20upx;
					border-radius: 50%;
					bottom: 20upx;
					right: 20upx;
					background-color: red;
				}
			}
		}

		.new-list {
	 
			padding: 0 20upx;

			.title {
				padding: 30upx;
				background-color: #FFFFFF;
				border-radius: 18upx;
				font-weight: 600;
			}

			&-item {
				padding: 20upx 30upx;
				background-color: #FFFFFF;
				.desc {
					line-height: 50upx
				}
			}
		}
	}
</style>