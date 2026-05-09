<template>
	<view class="mescroll-down-component">
		<!-- 下拉刷新区域 -->
		<view class="mescroll-downwarp" v-if="option.use">
			<!-- 自定义下拉动画 -->
			<view class="down-content">
				<!-- 下拉箭头 + 文字 -->
				<view class="down-arrow" :class="{'rotate': type === 2 || type === 3}">
					<view class="arrow-line line1"></view>
					<view class="arrow-line line2"></view>
				</view>
				
				<!-- 加载动画 -->
				<view class="down-loading" v-if="type === 3">
					<view class="loading-circle" v-for="i in 3" :key="i" :style="{animationDelay: (i-1) * 0.15 + 's'}"></view>
				</view>
				
				<!-- 提示文字 -->
				<view class="down-text">
					{{ getDownText }}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'mescroll-down',
	props: {
		option: {
			type: Object,
			default: () => ({})
		},
		type: {
			type: Number,
			default: 0
		},
		rate: {
			type: Number,
			default: 0
		}
	},
	computed: {
		getDownText() {
			if (this.type === 3) {
				return this.option.textLoading || '刷新中...'
			}
			if (this.type === 2) {
				return this.option.textOutOffset || '松手刷新'
			}
			return this.option.textInOffset || '下拉刷新'
		}
	}
}
</script>

<style lang="scss" scoped>
.mescroll-down-component {
	.mescroll-downwarp {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 30rpx 0;
		
		.down-content {
			display: flex;
			flex-direction: column;
			align-items: center;
			
			.down-arrow {
				width: 40rpx;
				height: 40rpx;
				margin-bottom: 16rpx;
				position: relative;
				
				.arrow-line {
					position: absolute;
					width: 24rpx;
					height: 4rpx;
					background: #ff6000;
					border-radius: 2rpx;
					transition: transform 0.3s ease;
				}
				
				.line1 {
					top: 8rpx;
					left: 4rpx;
					transform: rotate(-45deg);
				}
				
				.line2 {
					top: 8rpx;
					right: 4rpx;
					transform: rotate(45deg);
				}
				
				&.rotate {
					.line1 {
						transform: rotate(45deg);
					}
					.line2 {
						transform: rotate(-45deg);
					}
				}
			}
			
			.down-loading {
				display: flex;
				gap: 8rpx;
				margin-bottom: 16rpx;
				
				.loading-circle {
					width: 12rpx;
					height: 12rpx;
					background: #ff6000;
					border-radius: 50%;
					animation: loading-bounce 1s ease-in-out infinite;
				}
			}
			
			.down-text {
				font-size: 26rpx;
				color: #999;
			}
		}
	}
}

@keyframes loading-bounce {
	0%, 80%, 100% {
		transform: scale(0.6);
		opacity: 0.4;
	}
	40% {
		transform: scale(1);
		opacity: 1;
	}
}
</style>
