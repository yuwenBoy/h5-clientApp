<template>
	<scroll-view 
		scroll-y 
		@scroll="onscroll" 
		class="page-container"
		:scroll-top="0"
		:enable-back-to-top="true"
		:show-scrollbar="true"
	>
		<nav-bar :scroll-top="scrollTop" :showBack="false" type="white" title="我的"></nav-bar>
		
		<!-- 顶部用户信息卡片 -->
		<view class="user-header">
			<view class="header-bg">
				<view class="gradient-overlay"></view>
			</view>
			<view class="user-card">
				<view class="avatar-section" @click="handleUserClick">
					<view class="avatar-wrapper">
						<image 
							:src="isLogin && userInfo.avatar ? userInfo.avatar : defaultAvatar" 
							class="avatar"
							mode="aspectFill"
						></image>
						<view class="vip-badge" v-if="isLogin">
							<text class="vip-text">VIP</text>
						</view>
						<view class="login-icon" v-else>
							<uni-icons type="personadd-filled" size="24" color="#fff"></uni-icons>
						</view>
					</view>
					<view class="user-info">
						<text class="user-name">{{ isLogin ? userInfo.nickname : '未登录' }}</text>
						<text class="user-phone">{{ isLogin ? formatPhone(userInfo.phone) : '点击登录享受更多服务' }}</text>
					</view>
					<view class="arrow-btn">
						<uni-icons :size="18" color="#999" type="arrowright" />
					</view>
				</view>
				
				<!-- 统计数据 -->
				<view class="stats-section">
					<view class="stat-item" @click="toOrder">
						<text class="stat-num">3</text>
						<text class="stat-label">待付款</text>
					</view>
					<view class="stat-item" @click="toOrder">
						<text class="stat-num">5</text>
						<text class="stat-label">待收货</text>
					</view>
					<view class="stat-item" @click="toOrder">
						<text class="stat-num">12</text>
						<text class="stat-label">全部订单</text>
					</view>
					<view class="stat-item">
						<text class="stat-num">0</text>
						<text class="stat-label">优惠券</text>
					</view>
				</view>
			</view>
		</view>
		
			<!-- 我的订单快捷入口 -->
		<view class="section-card">
			<view class="section-header">
				<text class="section-title">我的订单</text>
				<view class="more-link" @click="toOrder(0)">
					<text class="more-text">查看全部</text>
					<uni-icons :size="14" color="#999" type="arrowright" />
				</view>
			</view>
			<view class="order-grid">
				<view class="order-item" @click="toOrder(1)">
					<view class="order-icon pending">
						<text class="badge" v-if="orderCount.pending > 0">{{ orderCount.pending }}</text>
					</view>
					<text class="order-label">待付款</text>
				</view>
				<view class="order-item" @click="toOrder(3)">
					<view class="order-icon completed"></view>
					<text class="order-label">已完成</text>
				</view>
				<view class="order-item" @click="toOrder(4)">
					<view class="order-icon refund"></view>
					<text class="order-label">售后</text>
				</view>
			</view>
		</view>
		
		<!-- 功能菜单 -->
		<view class="section-card menu-section">
			<view class="menu-list">
				<view class="menu-item" @click="toMyInfo">
					<view class="menu-left">
						<view class="menu-icon address">
							<uni-icons :size="22" color="#fff" type="location-filled" />
						</view>
						<text class="menu-text">我的地址</text>
					</view>
					<uni-icons :size="16" color="#ccc" type="arrowright" />
				</view>
				<view class="menu-item" @click="toOrder">
					<view class="menu-left">
						<view class="menu-icon order">
							<uni-icons :size="22" color="#fff" type="list" />
						</view>
						<text class="menu-text">全部订单</text>
					</view>
					<uni-icons :size="16" color="#ccc" type="arrowright" />
				</view>
				<view class="menu-item" @click="isLogin ? handleLogout() : toLogin()">
					<view class="menu-left">
						<view class="menu-icon" :class="isLogin ? 'logout' : 'login'">
							<uni-icons :size="22" color="#fff" :type="isLogin ? 'closeempty' : 'person-filled'" />
						</view>
						<text class="menu-text">{{ isLogin ? '退出登录' : '登录/注册' }}</text>
					</view>
					<uni-icons :size="16" color="#ccc" type="arrowright" />
				</view>
				<view class="menu-item">
					<view class="menu-left">
						<view class="menu-icon service">
							<uni-icons :size="22" color="#fff" type="chatbubble-filled" />
						</view>
						<text class="menu-text">联系客服</text>
					</view>
					<uni-icons :size="16" color="#ccc" type="arrowright" />
				</view>
				<view class="menu-item">
					<view class="menu-left">
						<view class="menu-icon setting">
							<uni-icons :size="22" color="#fff" type="gear-filled" />
						</view>
						<text class="menu-text">设置</text>
					</view>
					<uni-icons :size="16" color="#ccc" type="arrowright" />
				</view>
			</view>
		</view>
		
		<!-- 底部占位 -->
		<view class="bottom-space"></view>
	</scroll-view>
</template>

<script>
	export default {
		data() {
			return {
				scrollTop: 0,
				isLogin: false,
				userInfo: {
					nickname: '',
					avatar: '',
					phone: ''
				},
				defaultAvatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
				clicking: false, // 防止重复点击
				orderCount: {
					pending: 0,
					completed: 0,
					afterSale: 0
				}
			}
		},
		onLoad() {
			this.checkLoginStatus()
		},
		onShow() {
			// 每次显示页面时检查登录状态
			this.refreshUserInfo()
		},
		methods: {
		checkLoginStatus() {
			// 使用 $utils.getStorage 读取（会自动添加项目前缀）
			const token = this.$utils.getStorage('token')
			this.isLogin = !!token && JSON.stringify(token) !== '{}'
			
			if (this.isLogin) {
				// 获取用户信息
				const userInfo = this.$utils.getStorage('userInfo') || {}
				this.userInfo = {
					nickname: userInfo.nickname || userInfo.userName || '用户',
					avatar: userInfo.avatar || userInfo.headImg || '',
					phone: userInfo.phone || userInfo.mobile || ''
				}
			}
		},
		refreshUserInfo() {
			// 强制刷新登录状态和用户信息
			const token = this.$utils.getStorage('token')
			const hasLogin = !!token && JSON.stringify(token) !== '{}'
			
			// 如果登录状态有变化，更新数据
			if (hasLogin !== this.isLogin) {
				this.isLogin = hasLogin
			}
			
			if (this.isLogin) {
				const userInfo = this.$utils.getStorage('userInfo') || {}
				this.userInfo = {
					nickname: userInfo.nickname || userInfo.userName || '用户',
					avatar: userInfo.avatar || userInfo.headImg || '',
					phone: userInfo.phone || userInfo.mobile || ''
				}
			} else {
				// 未登录时清空用户信息
				this.userInfo = { nickname: '', avatar: '', phone: '' }
			}
		},
			toMyInfo(e) {
				this.$Router.push({
					path: '/pages/user/address/list'
				})
			},
		toOrder(tabIndex = 0) {
			// 防止重复点击
			if (this.clicking) return
			this.clicking = true
			
			uni.navigateTo({
				url: `/pages/order/list?tab=${tabIndex}`
			})
			
			setTimeout(() => {
				this.clicking = false
			}, 500)
		},
		toLogin(e) {
			// 从当前页面进入登录，登录成功后返回当前页面
			uni.navigateTo({
				url: '/pages/user/login?redirect=user'
			})
		},
		onscroll(e) {
			this.scrollTop = e.detail.scrollTop
		},
		handleUserClick() {
			if (!this.isLogin) {
				this.toLogin()
			}
		},
		formatPhone(phone) {
			if (!phone) return ''
			return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
		},
		handleLogout() {
			uni.showModal({
				title: '提示',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						// 清除登录信息（使用 $utils.removeStorage）
						this.$utils.removeStorage('token')
						this.$utils.removeStorage('userInfo')
						this.isLogin = false
						this.userInfo = { nickname: '', avatar: '', phone: '' }
						this.$utils.toast('已退出登录')
					}
				}
			})
		}
	}
}
</script>

<style lang="less" scoped>
	.page-container {
		height: 100vh;
		background: linear-gradient(180deg, #f8f9fa 0%, #f0f2f5 100%);
	}

	// 顶部用户信息区域
	.user-header {
		position: relative;
		padding: 0 30rpx;
		padding-top: 120rpx;
		padding-bottom: 40rpx;

		.header-bg {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 400rpx;
			background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff9f43 100%);
			border-bottom-left-radius: 60rpx;
			border-bottom-right-radius: 60rpx;
			overflow: hidden;

			&::before {
				content: '';
				position: absolute;
				top: -50%;
				right: -20%;
				width: 400rpx;
				height: 400rpx;
				background: rgba(255, 255, 255, 0.1);
				border-radius: 50%;
			}

			&::after {
				content: '';
				position: absolute;
				bottom: 20%;
				left: -10%;
				width: 300rpx;
				height: 300rpx;
				background: rgba(255, 255, 255, 0.08);
				border-radius: 50%;
			}
		}
	}

	// 用户卡片
	.user-card {
		position: relative;
		z-index: 1;
		background: #fff;
		border-radius: 24rpx;
		padding: 40rpx 30rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
	}

	// 头像区域
	.avatar-section {
		display: flex;
		align-items: center;
		margin-bottom: 40rpx;

		.avatar-wrapper {
			position: relative;
			margin-right: 24rpx;

			.avatar {
				width: 120rpx;
				height: 120rpx;
				border-radius: 50%;
				border: 4rpx solid #fff;
				box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
			}

			.vip-badge {
				position: absolute;
				bottom: 0;
				right: 0;
				background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
				padding: 4rpx 12rpx;
				border-radius: 20rpx;
				border: 2rpx solid #fff;

				.vip-text {
					font-size: 18rpx;
					color: #fff;
					font-weight: bold;
				}
			}

			.login-icon {
				position: absolute;
				bottom: 0;
				right: 0;
				width: 40rpx;
				height: 40rpx;
				background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
				border-radius: 50%;
				border: 2rpx solid #fff;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}

		.user-info {
			flex: 1;
			display: flex;
			flex-direction: column;

			.user-name {
				font-size: 36rpx;
				font-weight: 600;
				color: #333;
				margin-bottom: 8rpx;
			}

			.user-phone {
				font-size: 26rpx;
				color: #999;
			}
		}

		.arrow-btn {
			width: 56rpx;
			height: 56rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #f5f5f5;
			border-radius: 50%;
		}
	}

	// 统计数据
	.stats-section {
		display: flex;
		justify-content: space-around;
		padding-top: 30rpx;
		border-top: 2rpx solid #f5f5f5;

		.stat-item {
			display: flex;
			flex-direction: column;
			align-items: center;

			.stat-num {
				font-size: 40rpx;
				font-weight: 700;
				color: #333;
				margin-bottom: 8rpx;
			}

			.stat-label {
				font-size: 24rpx;
				color: #666;
			}
		}
	}

	// 卡片通用样式
	.section-card {
		margin: 20rpx 30rpx;
		background: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
	}

	// 区块头部
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}

		.more-link {
			display: flex;
			align-items: center;

			.more-text {
				font-size: 24rpx;
				color: #999;
				margin-right: 4rpx;
			}
		}
	}

	// 订单网格
	.order-grid {
		display: flex;
		justify-content: space-around;

		.order-item {
			display: flex;
			flex-direction: column;
			align-items: center;

			.order-icon {
				width: 80rpx;
				height: 80rpx;
				border-radius: 50%;
				margin-bottom: 16rpx;
				position: relative;
				display: flex;
				align-items: center;
				justify-content: center;

				&.pending {
					background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
				}

				&.paid {
					background: linear-gradient(135deg, #4ecdc4 0%, #44a3aa 100%);
				}

				&.shipping {
					background: linear-gradient(135deg, #45b7d1 0%, #3498db 100%);
				}

				&.completed {
					background: linear-gradient(135deg, #96ceb4 0%, #7cb89f 100%);
				}

				&.refund {
					background: linear-gradient(135deg, #feca57 0%, #ff9f43 100%);
				}

				.badge {
					position: absolute;
					top: -8rpx;
					right: -8rpx;
					background: #ff4757;
					color: #fff;
					font-size: 20rpx;
					padding: 2rpx 12rpx;
					border-radius: 20rpx;
					border: 2rpx solid #fff;
				}
			}

			.order-label {
				font-size: 24rpx;
				color: #666;
			}
		}
	}

	// 菜单区域
	.menu-section {
		padding: 0 30rpx;
	}

	.menu-list {
		.menu-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 30rpx 0;
			border-bottom: 2rpx solid #f5f5f5;

			&:last-child {
				border-bottom: none;
			}

			&:active {
				opacity: 0.7;
			}

			.menu-left {
				display: flex;
				align-items: center;

				.menu-icon {
					width: 56rpx;
					height: 56rpx;
					border-radius: 16rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-right: 20rpx;

					&.address {
						background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					}

					&.order {
						background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
					}

					&.login {
						background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
					}

					&.service {
						background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
					}

				&.setting {
					background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
				}

				&.logout {
					background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
				}
				}

				.menu-text {
					font-size: 28rpx;
					color: #333;
				}
			}
		}
	}

	.bottom-space {
		height: 160rpx;
	}

	/* 适配底部安全区域 */
	@supports (padding-bottom: constant(safe-area-inset-bottom)) {
		.bottom-space {
			height: calc(160rpx + constant(safe-area-inset-bottom));
		}
	}

	@supports (padding-bottom: env(safe-area-inset-bottom)) {
		.bottom-space {
			height: calc(160rpx + env(safe-area-inset-bottom));
		}
	}
</style>
