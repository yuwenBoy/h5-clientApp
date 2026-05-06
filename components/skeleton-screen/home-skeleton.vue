<template>
	<view class="home-skeleton">
		<!-- 搜索栏骨架 -->
		<view class="skeleton-search">
			<view class="skeleton-line search-line"></view>
		</view>
		
		<!-- 定位栏骨架 -->
		<view class="skeleton-location">
			<view class="skeleton-circle small"></view>
			<view class="skeleton-line location-line"></view>
			<view class="skeleton-circle small"></view>
		</view>
		
		<!-- 轮播图骨架 -->
		<view class="skeleton-banner">
			<view class="skeleton-rect banner-rect"></view>
		</view>
		
		<!-- 分类骨架 -->
		<view class="skeleton-category">
			<view class="category-item" v-for="i in 8" :key="i">
				<view class="skeleton-circle category-circle"></view>
				<view class="skeleton-line category-text"></view>
			</view>
		</view>
		
		<!-- 商家列表骨架 -->
		<view class="skeleton-section-title">
			<view class="skeleton-line title-line"></view>
		</view>
		
		<view class="skeleton-store-list">
			<view class="skeleton-store-item" v-for="i in 4" :key="i">
				<view class="skeleton-rect store-img"></view>
				<view class="store-info">
					<view class="skeleton-line store-name"></view>
					<view class="skeleton-line store-status"></view>
					<view class="skeleton-line store-meta"></view>
					<view class="skeleton-line store-delivery"></view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'HomeSkeleton'
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

.home-skeleton {
	min-height: 100vh;
	background: #f5f5f5;
	padding-bottom: 40rpx;
}

.skeleton-search {
	padding: 15rpx 30rpx;
	background: #fff;
	
	.search-line {
		height: 64rpx;
		border-radius: 32rpx;
		@include skeleton-loading;
	}
}

.skeleton-location {
	display: flex;
	align-items: center;
	padding: 16rpx 30rpx;
	background: #fff;
	border-bottom: 1rpx solid #f0f0f0;
	
	.location-line {
		flex: 1;
		height: 32rpx;
		margin: 0 20rpx;
		@include skeleton-loading;
	}
}

.skeleton-banner {
	padding: 20rpx 30rpx;
	background: #fff;
	
	.banner-rect {
		width: 100%;
		height: 300rpx;
		border-radius: 16rpx;
		@include skeleton-loading;
	}
}

.skeleton-category {
	display: flex;
	flex-wrap: wrap;
	padding: 30rpx 0;
	background: #fff;
	
	.category-item {
		width: 25%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 30rpx;
	}
	
	.category-circle {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		@include skeleton-loading;
	}
	
	.category-text {
		width: 60rpx;
		height: 24rpx;
		margin-top: 16rpx;
		border-radius: 4rpx;
		@include skeleton-loading;
	}
}

.skeleton-section-title {
	padding: 30rpx;
	background: #fff;
	margin-top: 20rpx;
	
	.title-line {
		width: 160rpx;
		height: 36rpx;
		border-radius: 4rpx;
		@include skeleton-loading;
	}
}

.skeleton-store-list {
	background: #fff;
	
	.skeleton-store-item {
		display: flex;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}
	
	.store-img {
		width: 160rpx;
		height: 160rpx;
		border-radius: 8rpx;
		flex-shrink: 0;
		@include skeleton-loading;
	}
	
	.store-info {
		flex: 1;
		margin-left: 20rpx;
		
		.store-name {
			width: 60%;
			height: 36rpx;
			border-radius: 4rpx;
			@include skeleton-loading;
		}
		
		.store-status {
			width: 100rpx;
			height: 32rpx;
			margin-top: 16rpx;
			border-radius: 4rpx;
			@include skeleton-loading;
		}
		
		.store-meta {
			width: 40%;
			height: 28rpx;
			margin-top: 16rpx;
			border-radius: 4rpx;
			@include skeleton-loading;
		}
		
		.store-delivery {
			width: 50%;
			height: 28rpx;
			margin-top: 16rpx;
			border-radius: 4rpx;
			@include skeleton-loading;
		}
	}
}

// 通用骨架元素
.skeleton-line {
	@include skeleton-loading;
}

.skeleton-circle {
	@include skeleton-loading;
	
	&.small {
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
	}
}

.skeleton-rect {
	@include skeleton-loading;
}
</style>
