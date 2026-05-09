<template>
	<view class="network-error" v-if="show">
		<view class="error-container">
			<image class="error-icon" :src="iconPath" mode="aspectFit" />
			<view class="error-title">{{ title }}</view>
			<view class="error-desc">{{ description }}</view>
			<view class="error-btn" @click="handleRetry">{{ buttonText }}</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'network-error',
	props: {
		// 是否显示
		show: {
			type: Boolean,
			default: false
		},
		// 错误类型：network, server, timeout
		type: {
			type: String,
			default: 'network'
		},
		// 自定义标题
		title: {
			type: String,
			default: ''
		},
		// 自定义描述
		description: {
			type: String,
			default: ''
		},
		// 按钮文字
		buttonText: {
			type: String,
			default: '重新加载'
		}
	},
	computed: {
		iconPath() {
			const icons = {
				network: '/static/images/network-error.png',
				server: '/static/images/server-error.png',
				timeout: '/static/images/timeout.png'
			}
			return this.customIcon || icons[this.type] || icons.network
		}
	},
	methods: {
		handleRetry() {
			this.$emit('retry')
		}
	}
}
</script>

<style lang="scss" scoped>
.network-error {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(255, 255, 255, 0.98);
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
	
	.error-container {
		text-align: center;
		padding: 60rpx;
		
		.error-icon {
			width: 240rpx;
			height: 240rpx;
			margin-bottom: 40rpx;
		}
		
		.error-title {
			font-size: 32rpx;
			font-weight: 500;
			color: #333;
			margin-bottom: 16rpx;
		}
		
		.error-desc {
			font-size: 26rpx;
			color: #999;
			line-height: 1.6;
			margin-bottom: 40rpx;
		}
		
		.error-btn {
			display: inline-block;
			padding: 20rpx 60rpx;
			background: linear-gradient(135deg, #ff6b35, #ff8f5a);
			color: #fff;
			font-size: 28rpx;
			border-radius: 50rpx;
			box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.3);
			
			&:active {
				transform: scale(0.96);
				opacity: 0.9;
			}
		}
	}
}
</style>
