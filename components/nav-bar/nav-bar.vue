<template>
	<!-- 状态栏高度 导航栏高度 胶囊高度 -->
	<view :class="colorType === 'black'? 'black' : 'white'">
		<view class="navBar">
			<view class="navBar-bg" :style="{'background': 'url('+ bgStyle +') top center / 100% auto no-repeat'}">
				<view class="navBar-bg-mb"></view>
				<view class="navBar-bg-linear"></view>
			</view>
		</view>
		<view class="team-navBar-header flex warp" :style="{
				'background': background,
				'border': navBorder}">
			<view class="mpwx-top" :style="{'height': mpwxTop}"></view>
			<view class="team-navBar-header-con flex align-center" :style="{
				'height': navHeight}">
				<!-- left -->
				<view class="team-navBar-header-left">
					<text v-if="isShowBack" class="back-icon" @click="back"></text>
				</view>
				<!-- middle -->
				<view class="team-navBar-header-mid flex justify-center align-center">
					<text class="fs34 title" :class="fwb?'fwb':''">{{ title }}</text>
				</view>
				<!-- right -->
				<view class="team-navBar-header-right"></view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name:"nav-bar",
		props: {
			type: {
				type: String,
				default: 'black'
			},
			title: {
				type: String,
				default: ''
			},
			scrollTop: {
				type: Number,
				default: 0
			},
			navBg: {
				type: String,
				default: 'transparent'
			},
			showBack: {
				type: Boolean,
				default:true
			},
			bg: {
				type: String,
				default: ''
			},
			fwb: {
				type: Boolean,
				default:true
			},
			intercept: {
				type: Boolean,
				default:false
			}
		},
		data() {
			return {
				scroll: this.scrollTop,
				background: this.navBg,
				navBorder: 0,
				bgStyle: this.bg,
				isShowBack: this.showBack,
				colorType: this.type,
				mpwxTop: '20px',
				navHeight: '40px'
			};
		},
		mounted() {
			this.mpwxTop = wx.getSystemInfoSync().statusBarHeight + 'px'
			this.navHeight = this.$utils.checkUserSystem() ? '40px' : '48px'
		},
		methods: {
			back () {
				if(this.intercept){
					this.$emit('backIntercept')
				}else{
					uni.navigateBack({
						delta: 1,
						animationType: 'pop-out',
						animationDuration: 200,
						fail: () =>{
							uni.switchTab({
								url: '/pages/home/home'
							});
						}
					})
				}
			}
		},
		watch: {
			scrollTop: {
				handler:function(val, oldval){
					this.scroll = val
					let opacity = 0
					let tabHeight = 120 // 滚动到tabHeight的时候头部透明度为1
					if (this.scroll < tabHeight) {
						if (this.scroll < 15) {
							opacity = 0
							this.colorType = this.type
						} else {
							opacity = this.scroll / tabHeight
							this.colorType = 'black'
						}
					} else {
						this.colorType = 'black'
						opacity = 1
					}
					this.background = `rgba(255, 255, 255, ${opacity})`
					this.navBorder = `${opacity}px solid #EDEDED`
				},
				deep: true,//对象内部的属性监听，也叫深度监听
				immediate: true
			},
			bg: {
				handler:function(val, oldval){
					this.bgStyle = val
				},
				deep: true,//对象内部的属性监听，也叫深度监听
				immediate: true
			},
			navBg: {
				handler:function(val, oldval){
					this.background = val
				},
				deep: true,//对象内部的属性监听，也叫深度监听
				immediate: true
			}
		}
	}
</script>

<style lang="scss" scoped>
	.navBar {
		width: 100%;
		height: 340upx;
		position: absolute;
		z-index: -1;
		&-bg {
			width: 100%;
			height: inherit;
			position: absolute;
			top: 0;
			left: 0;
			filter: blur(45upx);
			&-mb {
				background: #FFFFFF;
				opacity: .65;
				width: 100%;
				height: 100%;
				position: absolute;
				top: 0;
				left: 0;
			}
			&-linear {
				width: 100%;
				height: 114upx;
				background: linear-gradient(180deg, rgba(243, 243, 243, 0) 0%, #F3F3F3 100%);
				position: absolute;
				bottom: 0;
				left: 0;
			}
		}
	}
	.mpwx-top {
		width: 100%;
	}
	.team-navBar-header {
		position: fixed;
		width: 100%;
		z-index: 9;
		&-con {
			width: 100%;
		}
		&-left {
			width: 20%;
			text-align: left;
		}
		&-mid {
			width: 60%;
		}
		&-right {
			width: 20%;
		}
	}
	.black {
		.back-icon {
			background: url(../../static/img/back_icon.png) no-repeat;
			background-size: 16upx 30upx;
			background-position: center;
			width: 60upx;
			height: 60upx;
			display: inline-block;
		}
	}
	.white {
		.title {
			color: #FFFFFF;
		}
		.back-icon {
			background: url('https://img.app.fuduoka.com/h5/img/icon/white_arrow.png') no-repeat;
			background-size: 16upx 30upx;
			background-position: center;
			width: 60upx;
			height: 60upx;
			display: inline-block;
			transform: rotate(180deg);
		}
	}
</style>
