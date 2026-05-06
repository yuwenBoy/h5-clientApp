<template>
	<view class="store-detail-skeleton">
		<!-- 门店头部骨架 -->
		<view class="skeleton-header">
			<view class="header-bg"></view>
			<view class="store-info">
				<view class="skeleton-circle store-logo"></view>
				<view class="store-meta">
					<view class="skeleton-line store-name"></view>
					<view class="skeleton-line store-simple"></view>
					<view class="skeleton-line store-time"></view>
				</view>
			</view>
		</view>
		
		<!-- Tab栏骨架 -->
		<view class="skeleton-tab">
			<view class="skeleton-line tab-item"></view>
			<view class="skeleton-line tab-item"></view>
		</view>
		
		<!-- 菜单内容骨架 -->
		<view class="skeleton-menu">
			<!-- 左侧分类骨架 -->
			<view class="skeleton-sidebar">
				<view class="skeleton-line sidebar-item" v-for="i in 8" :key="i"></view>
			</view>
			
			<!-- 右侧商品骨架 -->
			<view class="skeleton-goods-list">
				<view class="skeleton-category-title">
					<view class="skeleton-line title-line"></view>
				</view>
				
				<view class="skeleton-goods-item" v-for="i in 6" :key="i">
					<view class="skeleton-rect goods-img"></view>
					<view class="goods-info">
						<view class="skeleton-line goods-name"></view>
						<view class="skeleton-line goods-sales"></view>
						<view class="goods-bottom">
							<view class="skeleton-line goods-price"></view>
							<view class="skeleton-circle goods-btn"></view>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 底部结算栏骨架 -->
		<view class="skeleton-submit-bar">
			<view class="skeleton-circle cart-icon"></view>
			<view class="skeleton-line price-line"></view>
			<view class="skeleton-rect submit-btn"></view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'StoreDetailSkeleton'
}
</script>

<style lang="scss" scoped>
// 骨架屏动画
@mixin skeleton-loading {
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}

.store-detail-skeleton {
	height: 100vh;
	background: #f5f5f5;
	display: flex;
	flex-direction: column;
}

.skeleton-header {
	position: relative;
	padding: 40rpx 30rpx;
	background: #fff;
	
	.header-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 200rpx;
		background: linear-gradient(135deg, #ff6b35, #ff8533);
		opacity: 0.1;
	}
	
	.store-info {
		position: relative;
		display: flex;
		z-index: 1;
	}
	
	.store-logo {
		width: 120rpx;
		height: 120rpx;
		border-radius: 8rpx;
		@include skeleton-loading;
	}
	
	.store-meta {
		flex: 1;
		margin-left: 20rpx;
		
		.store-name {
			width: 60%;
			height: 40rpx;
			border-radius: 4rpx;
			@include skeleton-loading;
		}
		
		.store-simple {
			width: 40%;
			height: 28rpx;
			margin-top: 16rpx;
			border-radius: 4rpx;
			@include skeleton-loading;
		}
		
		.store-time {
			width: 50%;
			height: 28rpx;
			margin-top: 16rpx;
			border-radius: 4rpx;
			@include skeleton-loading;
		}
	}
}

.skeleton-tab {
	display: flex;
	background: #fff;
	border-bottom: 1rpx solid #eee;
	padding: 0 100rpx;
	
	.tab-item {
		flex: 1;
		height: 80rpx;
		margin: 0 40rpx;
		@include skeleton-loading;
	}
}

.skeleton-menu {
	flex: 1;
	display: flex;
	overflow: hidden;
}

.skeleton-sidebar {
	width: 160rpx;
	background: #f8f8f8;
	padding: 20rpx 0;
	
	.sidebar-item {
		height: 60rpx;
		margin: 0 20rpx 20rpx;
		border-radius: 4rpx;
		@include skeleton-loading;
	}
}

.skeleton-goods-list {
	flex: 1;
	background: #fff;
	padding: 20rpx;
	overflow: hidden;
}

.skeleton-category-title {
	margin-bottom: 20rpx;
	
	.title-line {
		width: 120rpx;
		height: 36rpx;
		border-radius: 4rpx;
		@include skeleton-loading;
	}
}

.skeleton-goods-item {
	display: flex;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
	
	.goods-img {
		width: 160rpx;
		height: 160rpx;
		border-radius: 8rpx;
		flex-shrink: 0;
		@include skeleton-loading;
	}
	
	.goods-info {
		flex: 1;
		margin-left: 20rpx;
		
		.goods-name {
			width: 80%;
			height: 32rpx;
			border-radius: 4rpx;
			@include skeleton-loading;
		}
		
		.goods-sales {
			width: 100rpx;
			height: 24rpx;
			margin-top: 16rpx;
			border-radius: 4rpx;
			@include skeleton-loading;
		}
		
		.goods-bottom {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-top: 30rpx;
			
			.goods-price {
				width: 80rpx;
				height: 36rpx;
				border-radius: 4rpx;
				@include skeleton-loading;
			}
			
			.goods-btn {
				width: 48rpx;
				height: 48rpx;
				border-radius: 50%;
				@include skeleton-loading;
			}
		}
	}
}

.skeleton-submit-bar {
	display: flex;
	align-items: center;
	padding: 20rpx 30rpx;
	background: #fff;
	border-top: 1rpx solid #eee;
	
	.cart-icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		@include skeleton-loading;
	}
	
	.price-line {
		flex: 1;
		height: 40rpx;
		margin: 0 30rpx;
		border-radius: 4rpx;
		@include skeleton-loading;
	}
	
	.submit-btn {
		width: 180rpx;
		height: 72rpx;
		border-radius: 36rpx;
		@include skeleton-loading;
	}
}

// 通用骨架元素
.skeleton-line {
	@include skeleton-loading;
}

.skeleton-circle {
	@include skeleton-loading;
}

.skeleton-rect {
	@include skeleton-loading;
}
</style>
