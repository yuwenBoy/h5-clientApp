<template>
	<scroll-view scroll-y @scroll="onscroll">
		<nav-bar :scroll-top="scrollTop" :showBack="false" type="white" title="我的"></nav-bar>
		<view class="myinfo flex center align flex-direction">
			<view class="top-content">
				 <view class="box">
					 <image src="../../static/img/logo.png"></image>
					 <view class="fs32">顾客端</view>
				 </view>
			</view>
			<view class="user-list">
				<view class="user-list-item" @click="toMyInfo">
					<view class="left-icon info"></view>
					<text class="info-text">地址</text>
					<uni-icons :size="20" class="uni-icon-wrapper" color="#bbb" type="arrowright" />
				</view>
				<view class="user-list-item">
					<view class="left-icon switch"></view>
					<text class="info-text">切换学生</text>
					<uni-icons :size="20" class="uni-icon-wrapper" color="#bbb" type="arrowright" />
				</view>
				<view class="user-list-item" @click="toOrder">
					<view class="left-icon order"></view>
					<text class="info-text">我的订单</text>
					<uni-icons :size="20" class="uni-icon-wrapper" color="#bbb" type="arrowright" />
				</view>
				<view class="user-list-item" @click="toLogin">
					<view class="left-icon order"></view>
					<text class="info-text">登录/注册</text>
					<uni-icons :size="20" class="uni-icon-wrapper" color="#bbb" type="arrowright" />
				</view>
				<!-- <view class="user-list-item" @click="toAbout">
					<view class="left-icon about"></view>
					<text class="info-text">关于号家军</text>
					<uni-icons :size="20" class="uni-icon-wrapper" color="#bbb" type="arrowright" />
				</view> -->
			</view>
		</view>
	</scroll-view>
</template>

<script>
	export default {
		data() {
			return {
				pic: '../../static/images/me/头像.png',
				show: true,
				swiperList: [{
					url: '../../static/images/me/小banner.png',
				}],
				scrollTop: 0,
			}
		},
		onLoad() {

		},
		methods: {
			toMyInfo(e) {
				this.$Router.push({
					path: '/pages/user/myinfo'
				})
			},
			toAbout(e) {
				this.$Router.push({
					path: '/pages/user/about'
				})
			},
			toOrder(e) {
				this.$Router.push({
					path: '/pages/user/order'
				})
			},
			toLogin(e){
				this.$Router.push({
					path: '/pages/user/login'
				})
			},
			// 监听页面滚动
			onscroll (e) {
				this.scrollTop = e.detail.scrollTop
			},
		}
	}
</script>

<style lang="less" scoped>
	.myinfo {
		.top-content {
	  	background: linear-gradient(to bottom, #03A9F4, #00BCD4);
			width: 100%;
			height: 300upx;
			background-size: 100% auto;
			padding-top: 150upx;
			text-align: center;
			border-bottom-left-radius: 30upx;
			border-bottom-right-radius: 30upx;
       .box{
				 margin: 0 20upx;
				 border-radius: 16upx;
				 background: #FFFFFF;
				 padding-bottom: 20upx;
				 image {
				 	width: 240upx;
				 	height: 240upx;
				 	border-radius: 50%;
				 	border: 2upx solid #CCCCCC;
				 	margin-top: 30upx;
				 	margin-bottom: 20upx;
				 }
			 }
		}

		.user-list {
			position: relative;
			margin-top: 220rpx;
			width: 100%;

			&-item {
				font-size: 28upx;
				padding: 20upx 30upx;
				margin: 20upx;
				background: #FFFFFF;
				display: flex;
				align-items: center;
				border-radius: 16upx;
				position: relative;
				.uni-icon-wrapper{
					position: absolute;
					right: 20upx;
				}
			}

			.left-icon {
				display: inline-block;
				width: 64upx;
				height: 64upx;
				margin-right: 10upx;
				background-position: center center !important;
				background-size: 75% 75% !important;
			}

			.info {
				background: url(../../static/img/user/info.png) no-repeat;
			}

			.switch {
				background: url(../../static/img/user/switch-account.png) no-repeat;
			}

			.order {
				background: url(../../static/img/user/order.png) no-repeat;
			}

			.about {
				background: url(../../static/img/user/about.png) no-repeat;
			}
		}
	}
</style>