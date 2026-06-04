<template>
	<view class="order-detail">
		<!-- 顶部导航栏 -->
		<view class="nav-bar" :class="{ 'nav-scrolled': scrolled }">
			<view class="nav-back" @click="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="nav-status" v-if="scrolled">订单{{ order.orderStatusText || getStatusText(order.orderStatus) }}</text>
			<view class="nav-right"></view>
		</view>

		<!-- 加载状态 -->
		<view v-if="loading" class="loading-container">
			<text class="loading-text">加载中...</text>
		</view>

		<template v-else>
			<!-- 订单状态 -->
			<view class="status-bar" :class="getStatusClass(order.orderStatus)" @click="showLogistics">
				<view class="status-row">
					<text class="status-text">订单{{ order.orderStatusText || getStatusText(order.orderStatus) }}</text>
					<text class="status-arrow" v-if="order.orderStatus === 5">›</text>
				</view>
			</view>

			<!-- 收货信息 -->
			<view class="address-bar">
				<view class="address-info">
					<text class="address-title">送至</text>
					<text class="address-content">{{ order.addressDetail }} {{ order.addressName }}
						{{ order.addressPhone }}</text>
				</view>
			</view>

			<!-- 快捷操作栏 -->
			<view class="quick-actions">
				<view class="action-item" @click="backHome" v-if="order.orderStatus === 5">
					<text class="action-icon">🛒</text>
					<text class="action-text">再来一单</text>
				</view>
				<view class="action-item" @click="contactMerchant" v-if="showContactMerchant">
					<text class="action-icon">💬</text>
					<text class="action-text">联系商家</text>
				</view>
				<view class="action-item" @click="showRiderContact"
					v-if="order.riderName && (order.orderStatus === 4 || order.orderStatus === 5)">
					<text class="action-icon">🚴</text>
					<text class="action-text">联系骑手</text>
				</view>
				<view class="action-item" @click="goReview" v-if="order.orderStatus === 5 && !order.isReviewed">
					<text class="action-icon">⭐</text>
					<text class="action-text">去评价</text>
				</view>
			</view>

			<!-- 门店信息 + 商品列表 -->
			<view class="section-card">
				<view class="store-header" @click="toStore">
					<text class="store-name">{{ order.storeName }}</text>
					<image class="store-arrow" src="/static/img/city-icon.png" mode="aspectFit" />
				</view>
				<view class="goods-list">
					<view class="goods-item" v-for="(item, i) in order.goods" :key="i">
						<image class="goods-img" :src="item.img || '/static/img/goods-default.png'" mode="aspectFill" />
						<view class="goods-info">
							<text class="goods-name">{{ item.productName }}</text>
							<text class="goods-spec" v-if="item.specName">{{ item.specName }}</text>
							<view class="goods-bottom">
								<text class="goods-price">¥{{ item.price }}</text>
								<text class="goods-count-text">x{{ item.count }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 金额明细 -->
			<view class="section-card">
				<view class="card-header">
					<text class="card-title">金额明细</text>
				</view>
				<view class="price-list">
					<view class="price-item">
						<text class="price-label">商品总价</text>
						<text class="price-value">¥{{ order.goodsTotal }}</text>
					</view>
					<view class="price-item">
						<text class="price-label">配送费</text>
						<text class="price-value">¥{{ order.deliveryFee || 0 }}</text>
					</view>
					<view class="price-item" v-if="order.discount > 0">
						<text class="price-label">店铺优惠</text>
						<text class="price-value discount">-¥{{ order.discount }}</text>
					</view>
					<view class="price-item" v-if="order.couponDiscount > 0">
						<text class="price-label">优惠券</text>
						<text class="price-value discount">-¥{{ order.couponDiscount }}</text>
					</view>
					<view class="price-divider"></view>
					<view class="price-total">
						<text class="price-label">实付金额</text>
						<text class="price-value total copyable" @click="copyPrice">¥{{ order.finalTotal }}</text>
					</view>
				</view>
			</view>

			<!-- 订单信息（可折叠） -->
			<view class="section-card">
				<view class="card-header" @click="toggleOrderInfo">
					<text class="card-title">订单信息</text>
					<image class="expand-icon" :class="{ expanded: showOrderInfo }" src="/static/img/city-icon.png"
						mode="aspectFit" />
				</view>
				<view class="order-info-content" v-show="showOrderInfo">
					<view class="order-info-row">
						<text class="info-label">收货信息</text>
						<text class="info-value">{{ order.addressName }} {{ order.addressPhone }} {{ order.addressDetail }}</text>
					</view>
					<view class="order-info-row" v-if="order.remark">
						<text class="info-label">备注</text>
						<text class="info-value">{{ order.remark }}</text>
					</view>
					<view class="order-info-row" v-if="order.riderName">
						<text class="info-label">配送骑士</text>
						<text class="info-value">{{ order.riderName }} {{ order.riderPhone }}</text>
					</view>
					<view class="order-info-row">
						<text class="info-label">送达时间</text>
						<text class="info-value">{{ order.deliveryTime || '-' }}</text>
					</view>
					<view class="order-info-row">
						<text class="info-label">下单时间</text>
						<text class="info-value">{{ formatDateTime(order.createTime) }}</text>
					</view>
					<view class="order-info-row">
						<text class="info-label">支付方式</text>
						<text class="info-value">{{ formatPayMethod(order.payMethod) }}</text>
					</view>
					<view class="order-info-row">
						<text class="info-label">订单编号</text>
						<text class="info-value copyable" @click="copyOrderNo">{{ order.orderNo }}</text>
					</view>
				</view>
				<!-- 默认显示订单号 -->
				<view class="order-info-default" v-show="!showOrderInfo">
					<text class="info-label">订单编号</text>
					<text class="info-value copyable" @click="copyOrderNo">{{ order.orderNo }}</text>
				</view>
			</view>

			<!-- 服务保障 -->
			<view class="service-card">
				<view class="service-item">
					<text class="service-icon">🛡️</text>
					<text class="service-text">正品保障</text>
				</view>
				<view class="service-item">
					<text class="service-icon">💯</text>
					<text class="service-text">品质保证</text>
				</view>
				<view class="service-item">
					<text class="service-icon">🚀</text>
					<text class="service-text">准时送达</text>
				</view>
			</view>
		</template>

		<!-- 联系弹窗 -->
		<ContactModal :visible="contactModalVisible" :title="contactModalTitle" :items="contactModalItems"
			:smallIcons="contactModalSmallIcons" @close="contactModalVisible = false" @select="handleContactSelect" />
	</view>
</template>

<script>
	import ContactModal from '@/components/ContactModal/ContactModal.vue'

	const OrderStatus = {
		UNPAID: 0,
		PENDING_ACCEPT: 1,
		ACCEPTED_PREPARE: 2,
		DAIPEISONG: 3,
		PEISONGZHONG: 4,
		YIWANCHENG: 5,
		CANCELED_MANUAL: 6,
		CANCELED_TIMEOUT: 7,
		REFUND_ALL_PART: 8
	}

	export default {
		components: {
			ContactModal
		},
		data() {
			return {
				orderId: null,
				merchantUserId: null,
				loading: true,
				storeLogo: '/static/img/store-default.png',
				countdownText: '',
				isWarning: false,
				countdownTimer: null,
				hasWarned: false,
				showOrderInfo: false,
				scrolled: false,
				contactModalVisible: false,
				contactModalTitle: '',
				contactModalItems: [],
				contactModalSmallIcons: false,
				contactModalType: '', // 'merchant' or 'rider'
				order: {
					orderNo: '',
					orderStatus: 0,
					orderStatusText: '',
					createTime: '',
					payMethod: '',
					payStatus: 0,
					payTime: null,
					deliveryTime: '尽快送达',
					storeId: null,
					storeName: '',
					userId: '',
					goodsTotal: 0,
					deliveryFee: 0,
					discount: 0,
					couponDiscount: 0,
					finalTotal: 0,
					remark: '',
					addressName: '',
					addressPhone: '',
					addressDetail: '',
					isDefaultAddress: false,
					riderId: null,
					riderName: '',
					riderPhone: '',
					cancelReason: '',
					goods: [],
					storePhone: ''
				}
			}
		},
		computed: {
			totalGoodsCount() {
				return this.order.goods.reduce((sum, item) => sum + (item.count || 1), 0)
			},
			showContactMerchant() {
				return [0, 1, 2, 3, 4, 5].includes(this.order.orderStatus)
			}
		},
		onLoad(options) {
			// 使用 $Route 获取参数，兼容多种方式
			const query = options || this.$Route?.query || {}
			this.orderId = query.id
			this.merchantUserId = query.merchantUserId
			if (this.orderId) {
				this.getOrderDetail()
			} else {
				uni.showToast({
					title: '订单ID不存在',
					icon: 'none'
				})
			}
		},
		mounted() {
			// 使用 $Route 获取参数，兼容多种方式
			const query = this.$Route?.query || {}
			this.orderId = query.id
			this.merchantUserId = query.merchantUserId
			if (this.orderId) {
				this.getOrderDetail()
			}
		},
		onShow() {
			this.scrolled = false
		},

		onPageScroll(e) {
			this.scrolled = e.scrollTop > 60
		},

		onUnload() {
			this.stopCountdown()
		},

		onPullDownRefresh() {
			this.getOrderDetail().finally(() => {
				uni.stopPullDownRefresh()
			})
		},

		methods: {
			goBack() {
				uni.navigateBack({
					fail: () => {
						uni.switchTab({
							url: '/pages/home/home'
						})
					}
				})
			},

			toggleOrderInfo() {
				this.showOrderInfo = !this.showOrderInfo
			},

			initCountdown() {
				const remainMs = this.calculateRemainTime()
				if (remainMs > 0) {
					this.countdownText = this.$utils.formatCountdown(remainMs)
					this.isWarning = this.$utils.isExpiringSoon(remainMs)
					this.startCountdown()
				} else {
					this.countdownText = '00:00'
					this.isWarning = false
				}
			},

			startCountdown() {
				this.stopCountdown()
				this.countdownTimer = setInterval(() => {
					this.updateCountdown()
				}, 1000)
			},

			stopCountdown() {
				if (this.countdownTimer) {
					clearInterval(this.countdownTimer)
					this.countdownTimer = null
				}
			},

			updateCountdown() {
				if (this.order.orderStatus !== 0) {
					this.stopCountdown()
					return
				}

				const remainMs = this.calculateRemainTime()
				if (remainMs > 0) {
					this.countdownText = this.$utils.formatCountdown(remainMs)
					this.isWarning = this.$utils.isExpiringSoon(remainMs)

					if (this.isWarning && !this.hasWarned) {
						this.hasWarned = true
						this.showExpiringWarning()
					}
				} else {
					this.countdownText = '00:00'
					this.isWarning = false
					this.stopCountdown()
					// 倒计时结束，自动取消订单
					this.autoCancelOrder()
				}
			},

			async autoCancelOrder() {
				uni.showModal({
					title: '支付超时',
					content: '您的订单已超过 30 分钟未支付，将自动取消',
					showCancel: false,
					success: () => {
						this.cancelOrderApi()
					}
				})
			},

			async cancelOrderApi() {
				try {
					await this.$request.post(this.$apis.order.cancel, {
						orderId: parseInt(this.orderId),
						cancelReason: '支付超时自动取消'
					})
					uni.showToast({
						title: '订单已取消',
						icon: 'none'
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				} catch (error) {
					console.error('自动取消订单失败', error)
				}
			},

			calculateRemainTime() {
				const expireTime = this.$utils.calculateExpireTime(
					this.order.expireTime,
					this.order.createTime,
					30
				)
				return expireTime - Date.now()
			},

			showExpiringWarning() {
				uni.showModal({
					title: '⚠️ 支付即将超时',
					content: `您的订单将在 ${this.countdownText} 后自动取消，请尽快完成支付！`,
					confirmText: '立即支付',
					cancelText: '知道了',
					success: (res) => {
						if (res.confirm) {
							this.toPay()
						}
					}
				})
			},

			async getOrderDetail() {
				this.loading = true
				try {
					const res = await this.$request.post(this.$apis.order.detail, {
						orderId: parseInt(this.orderId)
					})

					if (res.success && res.result) {
						const order = res.result

						if (order.goods && order.goods.length > 0) {
							order.goods = order.goods.map(item => {
								if (item.img) {
									item.img = this.$utils.processImageUrl ? this.$utils.processImageUrl(item.img) : item.img
								}
								return item
							})
						}

						this.order = order

						if (order.orderStatus === 0) {
							this.initCountdown()
						} else {
							this.stopCountdown()
						}
					} else {
						uni.showToast({
							title: res.message || '获取订单详情失败',
							icon: 'none'
						})
					}
				} catch (error) {
					console.error('获取订单详情失败:', error)
					uni.showToast({
						title: '获取订单详情失败',
						icon: 'none'
					})
				} finally {
					this.loading = false
				}
			},

			getStatusText(status) {
				const statusMap = {
					[OrderStatus.UNPAID]: '待支付',
					[OrderStatus.PENDING_ACCEPT]: '待接单',
					[OrderStatus.ACCEPTED_PREPARE]: '备货中',
					[OrderStatus.DAIPEISONG]: '待配送',
					[OrderStatus.PEISONGZHONG]: '配送中',
					[OrderStatus.YIWANCHENG]: '已完成',
					[OrderStatus.CANCELED_MANUAL]: '已取消',
					[OrderStatus.CANCELED_TIMEOUT]: '超时关闭',
					[OrderStatus.REFUND_ALL_PART]: '已退款'
				}
				return statusMap[status] || '未知状态'
			},

			getStatusDesc(status) {
				const descMap = {
					[OrderStatus.UNPAID]: '请尽快完成支付',
					[OrderStatus.PENDING_ACCEPT]: '商家正在接单中',
					[OrderStatus.ACCEPTED_PREPARE]: '商家正在准备商品',
					[OrderStatus.DAIPEISONG]: '商品已备好，等待配送',
					[OrderStatus.PEISONGZHONG]: '骑手正在配送中',
					[OrderStatus.YIWANCHENG]: '',
					[OrderStatus.CANCELED_MANUAL]: '订单已取消',
					[OrderStatus.CANCELED_TIMEOUT]: '订单超时关闭',
					[OrderStatus.REFUND_ALL_PART]: '订单已退款'
				}
				return descMap[status] || ''
			},

			getStatusClass(status) {
				const classMap = {
					[OrderStatus.UNPAID]: 'status-unpaid',
					[OrderStatus.PENDING_ACCEPT]: 'status-pending',
					[OrderStatus.ACCEPTED_PREPARE]: 'status-prepare',
					[OrderStatus.DAIPEISONG]: 'status-delivery',
					[OrderStatus.PEISONGZHONG]: 'status-delivering',
					[OrderStatus.YIWANCHENG]: 'status-finish',
					[OrderStatus.CANCELED_MANUAL]: 'status-cancel',
					[OrderStatus.CANCELED_TIMEOUT]: 'status-cancel',
					[OrderStatus.REFUND_ALL_PART]: 'status-cancel'
				}
				return classMap[status] || 'status-unpaid'
			},

			formatPayMethod(method) {
				const methodMap = {
					'wechat': '微信支付',
					'alipay': '支付宝',
					'balance': '余额支付',
					'': '未支付'
				}
				return methodMap[method] || method || '未支付'
			},

			formatDateTime(dateStr) {
				if (!dateStr) return '-'
				const date = new Date(dateStr)
				return date.toLocaleString('zh-CN', {
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit'
				}).replace(/\//g, '-')
			},

			showRiderContact() {
				if (!this.order.riderPhone) {
					uni.showToast({
						title: '骑手电话不存在',
						icon: 'none'
					})
					return
				}

				this.contactModalTitle = '联系骑手'
				this.contactModalItems = [{
						icon: '📞',
						text: '拨打电话',
						action: 'call'
					},
					{
						icon: '💬',
						text: '在线联系',
						action: 'chat'
					}
				]
				this.contactModalSmallIcons = true
				this.contactModalType = 'rider'
				this.contactModalVisible = true
			},

			chatWithRider() {
				if (!this.order.riderId) {
					uni.showToast({
						title: '骑手信息不存在',
						icon: 'none'
					})
					return
				}

				const riderName = '骑士' + this.order.riderName
				this.$Router.push({
					path: '/pages/im/chat',
					query: {
						userId: this.order.riderId,
						userName: encodeURIComponent(riderName),
						orderId: this.orderId,
						isBusiness: false,
					}
				})
			},

			callRider(phone) {
				if (!phone) return
				uni.makePhoneCall({
					phoneNumber: phone,
					fail: () => {
						uni.showToast({
							title: '拨打电话失败',
							icon: 'none'
						})
					}
				})
			},

			handleContactSelect(item) {
				if (this.contactModalType === 'merchant') {
					if (item.action === 'chat') {
						this.chatWithMerchant()
					} else if (item.action === 'call') {
						this.callMerchant(this.order.storePhone)
					}
				} else if (this.contactModalType === 'rider') {
					if (item.action === 'chat') {
						this.chatWithRider()
					} else if (item.action === 'call') {
						this.callRider(this.order.riderPhone)
					}
				}
			},

			showLogistics() {
				if (this.order.orderStatus === 5) {
					uni.showToast({
						title: '查看物流信息',
						icon: 'none'
					})
				}
			},

			goReview() {
				uni.navigateTo({
					url: `/pages/order/review?id=${this.order.id}`
				})
			},

			copyOrderNo() {
				uni.setClipboardData({
					data: this.order.orderNo,
					success: () => {
						uni.showToast({
							title: '复制成功',
							icon: 'success'
						})
					}
				})
			},

			copyPrice() {
				uni.setClipboardData({
					data: '¥' + this.order.finalTotal,
					success: () => {
						uni.showToast({
							title: '复制成功',
							icon: 'success'
						})
					}
				})
			},

			contactMerchant() {
				const items = []
				if (this.order.storePhone) {
					items.push({
						icon: '📞',
						text: '电话商家',
						action: 'call'
					})
				}
				
				if (this.order.storeId || this.order.merchantId) {
					items.push({
						icon: '💬',
						text: '在线联系',
						action: 'chat'
					})
				}

				if (items.length === 0) {
					uni.showToast({
						title: '暂无商家联系方式',
						icon: 'none'
					})
					return
				}

				this.contactModalTitle = '联系商家'
				this.contactModalItems = items
				this.contactModalSmallIcons = false
				this.contactModalType = 'merchant'
				this.contactModalVisible = true
			},

			chatWithMerchant() {
				if (!this.merchantUserId) {
					uni.showToast({
						title: '商家信息不存在',
						icon: 'none'
					})
					return
				}

				this.$Router.push({
					path: '/pages/im/chat',
					query: {
						userId: this.merchantUserId,
						userName: encodeURIComponent(this.order.storeName),
						orderId: this.orderId,
						isBusiness: true,
						fromUserId: this.order.userId,
						storeId: this.order.storeId
					}
				})
			},

			callMerchant(phone) {
				if (!phone) return
				uni.makePhoneCall({
					phoneNumber: phone
				})
			},

			toStore() {
				if (this.order.storeId) {
					this.$Router.push({
						path: '/pages/home/storeDetail',
						query: {
							id: this.order.storeId,
						}
					})
				} else {
					uni.showToast({
						title: '门店信息不存在',
						icon: 'none'
					})
				}
			},

			async cancelOrder() {
				uni.showModal({
					title: '确认取消',
					content: '确定取消该订单吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								const result = await this.$request.post(this.$apis.order.cancel, {
									orderId: parseInt(this.orderId),
									cancelReason: '用户主动取消'
								})

								if (result.success) {
									uni.showToast({
										title: '取消成功',
										icon: 'success'
									})
									setTimeout(() => this.getOrderDetail(), 1500)
								} else {
									uni.showToast({
										title: result.message || '取消失败',
										icon: 'none'
									})
								}
							} catch (error) {
								uni.showToast({
									title: '取消失败',
									icon: 'none'
								})
							}
						}
					}
				})
			},

			toPay() {
				uni.navigateTo({
					url: `/pages/order/pay?orderId=${this.orderId}&total=${this.order.finalTotal}`
				})
			},

			async confirmReceipt() {
				uni.showModal({
					title: '确认收货',
					content: '确认已收到商品吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								const result = await this.$request.post('/client/order/confirm-receipt', {
									orderId: parseInt(this.orderId)
								})

								if (result.success) {
									uni.showToast({
										title: '确认成功',
										icon: 'success'
									})
									setTimeout(() => this.getOrderDetail(), 1500)
								} else {
									uni.showToast({
										title: result.message || '确认失败',
										icon: 'none'
									})
								}
							} catch (error) {
								uni.showToast({
									title: '确认失败',
									icon: 'none'
								})
							}
						}
					}
				})
			},

			applyRefund() {
				uni.showModal({
					title: '申请退款',
					content: '确定要申请退款吗？',
					editable: true,
					placeholderText: '请输入退款原因',
					success: async (res) => {
						if (res.confirm && res.content) {
							try {
								const result = await this.$request.post('/client/order/apply-refund', {
									orderId: parseInt(this.orderId),
									reason: res.content
								})

								if (result.success) {
									uni.showToast({
										title: '申请已提交',
										icon: 'success'
									})
									setTimeout(() => this.getOrderDetail(), 1500)
								} else {
									uni.showToast({
										title: result.message || '申请失败',
										icon: 'none'
									})
								}
							} catch (error) {
								uni.showToast({
									title: '申请失败',
									icon: 'none'
								})
							}
						}
					}
				})
			},

			backHome() {
				uni.switchTab({
					url: '/pages/home/home'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #ff6b35;
	$success: #34c759;
	$warning: #ff9500;
	$danger: #ff3b30;
	$text-primary: #333;
	$text-secondary: #666;
	$text-hint: #999;

	.order-detail {
		background: #f5f5f5;
		min-height: 100vh;
		padding-bottom: 160rpx;
	}

	.nav-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 88rpx;
		background: #fff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30rpx;
		padding-top: env(safe-area-inset-top);
		z-index: 999;

		&.nav-scrolled {
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

			.nav-status {
				font-size: 30rpx;
				color: #333;
			}
		}

		.nav-back {
			width: 60rpx;
			height: 60rpx;
			display: flex;
			align-items: center;
			justify-content: center;

			.back-icon {
				font-size: 40rpx;
				color: $text-primary;
			}
		}

		.nav-status {
			flex: 1;
			text-align: left;
			font-size: 30rpx;
			color: #333;
		}

		.nav-right {
			width: 60rpx;
		}
	}

	.loading-container {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh;
		padding-top: calc(88rpx + env(safe-area-inset-top));

		.loading-text {
			color: $text-hint;
			font-size: 28rpx;
		}
	}

	.status-bar {
		padding: 30rpx;
		background: #fff;

		.status-row {
			display: flex;
			align-items: center;
			justify-content: flex-start;
		}

		.status-text {
			font-size: 40rpx;
			color: #333;
		}

		.status-arrow {
			font-size: 36rpx;
			color: $text-secondary;
			margin-left: 8rpx;
		}

		&.status-finish {
			.status-text {
				color: $text-primary;
			}
		}

		&.status-unpaid {
			.status-text {
				color: $primary;
			}
		}

		&.status-pending {
			.status-text {
				color: $warning;
			}
		}

		&.status-delivering {
			.status-text {
				color: #5856d6;
			}
		}

		&.status-cancel {
			.status-text {
				color: $text-hint;
			}
		}
	}

	.address-bar {
		background: #fff;
		padding: 30rpx;
		border-top: 1rpx solid #f5f5f5;

		.address-info {
			display: flex;
			align-items: flex-start;

			.address-title {
				font-size: 26rpx;
				color: #333;
				margin-right: 16rpx;
				flex-shrink: 0;
				font-weight: 500;
			}

			.address-content {
				font-size: 26rpx;
				color: $text-primary;
				flex: 1;
				line-height: 1.5;
			}
		}
	}

	.quick-actions {
		background: #fff;
		padding: 24rpx 30rpx;
		display: flex;
		gap: 40rpx;
		border-bottom: 1rpx solid #f5f5f5;

		.action-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			flex: 1;

			.action-icon {
				font-size: 40rpx;
				margin-bottom: 8rpx;
			}

			.action-text {
				font-size: 24rpx;
				color: $text-secondary;
			}
		}
	}

	.section-card {
		background: #fff;
		margin: 20rpx;
		border-radius: 16rpx;
		padding: 24rpx;

		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20rpx;

			.card-title {
				font-size: 30rpx;
				font-weight: bold;
				color: $text-primary;
			}

			.goods-count {
				font-size: 24rpx;
				color: $text-hint;
			}

			.expand-icon {
				width: 32rpx;
				height: 32rpx;
				transition: transform 0.3s;

				&.expanded {
					transform: rotate(180deg);
				}
			}
		}
	}

	.store-header {
		display: flex;
		align-items: center;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
		margin-bottom: 16rpx;

		.store-name {
			font-size: 32rpx;
			font-weight: bold;
			color: $text-primary;
			flex: 1;
		}

		.store-arrow {
			width: 40rpx;
			height: 40rpx;
			margin-left: 8rpx;
			transform: rotate(-90deg);
		}
	}

	.goods-list {
		.goods-item {
			display: flex;
			padding: 20rpx 0;
			border-bottom: 1rpx solid #f5f5f5;

			&:last-child {
				border-bottom: none;
			}

			.goods-img {
				width: 140rpx;
				height: 140rpx;
				border-radius: 12rpx;
				margin-right: 20rpx;
				background: #f5f5f5;
			}

			.goods-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: space-between;

				.goods-name {
					font-size: 28rpx;
					color: $text-primary;
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
				}

				.goods-spec {
					font-size: 24rpx;
					color: $text-hint;
				}

				.goods-bottom {
					display: flex;
					justify-content: space-between;
					align-items: center;

					.goods-price {
						font-size: 30rpx;
						font-weight: bold;
						color: $primary;
					}

					.goods-count-text {
						font-size: 26rpx;
						color: $text-hint;
					}
				}
			}
		}
	}

	.price-list {
		.price-item {
			display: flex;
			justify-content: space-between;
			padding: 12rpx 0;

			.price-label {
				font-size: 26rpx;
				color: $text-secondary;
			}

			.price-value {
				font-size: 26rpx;
				color: $text-primary;

				&.discount {
					color: $success;
				}

				&.total {
					font-size: 32rpx;
					font-weight: bold;
					color: $primary;
				}
			}
		}

		.price-divider {
			height: 1rpx;
			background: #eee;
			margin: 16rpx 0;
		}

		.price-total {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-top: 12rpx;

			.price-label {
				font-size: 28rpx;
				color: $text-primary;
				font-weight: 500;
			}
		}
	}

	.order-info-content {
		.order-info-row {
			display: flex;
			justify-content: space-between;
			padding: 16rpx 0;
			border-bottom: 1rpx solid #f5f5f5;

			&:last-child {
				border-bottom: none;
			}

			.info-label {
				font-size: 26rpx;
				color: $text-hint;
			}

			.info-value {
				font-size: 26rpx;
				color: $text-primary;

				&.remark {
					color: $primary;
				}

				&.cancel-reason {
					color: $text-hint;
				}
			}
		}
	}

	.order-info-default {
		display: flex;
		justify-content: space-between;
		padding: 16rpx 0;

		.info-label {
			font-size: 26rpx;
			color: $text-hint;
		}

		.info-value {
			font-size: 26rpx;
			color: $text-primary;
		}
	}



	.service-card {
		background: #fff;
		margin: 20rpx;
		border-radius: 16rpx;
		padding: 24rpx;
		display: flex;
		justify-content: space-around;

		.service-item {
			display: flex;
			flex-direction: column;
			align-items: center;

			.service-icon {
				font-size: 40rpx;
				margin-bottom: 12rpx;
			}

			.service-text {
				font-size: 24rpx;
				color: $text-secondary;
			}
		}
	}
</style>