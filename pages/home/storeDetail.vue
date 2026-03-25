<!-- pages/store/detail.vue -->
<template>
	<view class="store-page">
		<!-- 1. 门店头部 -->
		<view class="store-header">
			<view class="header-bg"></view>
			<view class="store-info">
				<image class="store-logo" :src="storeInfo.logo || defaultLogo" />
				<view class="store-meta">
					<view class="store-name">{{ storeInfo.name }}</view>
					<view class="store-simple">
						<text class="sales">月售{{ storeInfo.monthly_sales || 999 }}</text>
						<text class="time">{{ storeInfo.delivery_time || 30 }}分钟</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 2. Tab切换 -->
		<view class="tab-bar">
			<view class="tab-item" :class="{ active: activeTab === 'menu' }" @click="activeTab = 'menu'">
				点餐
			</view>
			<view class="tab-item" :class="{ active: activeTab === 'merchant' }" @click="activeTab = 'merchant'">
				商家
			</view>
		</view>

		<!-- 3. 点餐Tab -->
		<view class="tab-content" v-show="activeTab === 'menu'">
			<!-- 公告横向滚动 - 移到点餐Tab顶部 -->
			<view class="notice-bar">
				<view class="notice-icon">公告</view>
				<view class="notice-scroll">
					<view class="notice-content" :style="{ animationDuration: noticeDuration + 's' }">
						<text class="notice-text">{{ storeInfo.notice }}</text>
						<text class="notice-text">{{ storeInfo.notice }}</text>
					</view>
				</view>
			</view>

			<view class="main-content">
				<!-- 左侧分类 -->
				<scroll-view class="category-sidebar" scroll-y :scroll-top="sidebarScrollTop" scroll-with-animation>
					<view v-for="(cat, index) in categories" :key="index" class="cat-item"
						:class="{ active: activeCat === index }" @click="clickCategory(index)">
						{{ cat.name }}
					</view>
				</scroll-view>

				<!-- 右侧商品列表 -->
				<scroll-view class="goods-list" scroll-y :scroll-top="goodsScrollTop" scroll-with-animation
					@scroll="onGoodsScroll">
					<view v-for="(cat, cIndex) in categories" :key="cIndex" class="cat-section">
						<view class="cat-title">{{ cat.name }}</view>
						<view v-for="(goods, gIndex) in cat.goods" :key="gIndex" class="goods-item">
							<image class="goods-img" :src="goods.img" mode="aspectFill" />
							<view class="goods-info">
								<view class="goods-name">{{ goods.name }}</view>
								<view class="goods-desc">{{ goods.desc }}</view>
								<view class="goods-sales">月售 {{ goods.sales }}</view>
								<view class="goods-bottom">
									<view class="price-box">
										<text class="price-symbol">¥</text>
										<text class="price-value">{{ goods.price }}</text>
										<text class="price-original">¥{{ goods.original }}</text>
									</view>
									<view class="stepper">
										<view class="btn-minus" v-if="getGoodsCount(goods) > 0" @click.stop="decreaseGoods(goods)">
											<text class="minus-icon">−</text>
										</view>
										<text class="stepper-num" v-if="getGoodsCount(goods) > 0">
											{{ getGoodsCount(goods) }}
										</text>
										<view class="btn-plus" @click.stop="increaseGoods(goods)">
											<text class="plus-icon">+</text>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
					<!-- 底部占位，给购物车留空间 -->
					<view class="bottom-placeholder"></view>
				</scroll-view>
			</view>
		</view>

		<!-- 4. 商家Tab -->
		<view class="tab-content merchant-content" v-show="activeTab === 'merchant'">
			<view class="merchant-section">
				<view class="section-title">商家信息</view>
				<view class="info-item">
					<text class="label">商家名称</text>
					<text class="value">{{ storeInfo.name }}</text>
				</view>
				<view class="info-item">
					<text class="label">营业时间</text>
					<text class="value">{{ storeInfo.business_hours || '09:00-22:00' }}</text>
				</view>
				<view class="info-item">
					<text class="label">商家电话</text>
					<text class="value phone" @click="callPhone(storeInfo.phone)">{{ storeInfo.phone || '400-888-8888' }}</text>
				</view>
				<view class="info-item">
					<text class="label">商家地址</text>
					<text class="value">{{ storeInfo.address }}</text>
				</view>
			</view>

			<view class="merchant-section">
				<view class="section-title">配送信息</view>
				<view class="info-item">
					<text class="label">配送方式</text>
					<text class="value">商家配送</text>
				</view>
				<view class="info-item">
					<text class="label">配送时间</text>
					<text class="value">{{ storeInfo.delivery_time || 30 }}分钟</text>
				</view>
				<view class="info-item">
					<text class="label">配送费</text>
					<text class="value">¥{{ storeInfo.delivery_fee || 5 }}</text>
				</view>
				<view class="info-item">
					<text class="label">起送价</text>
					<text class="value">¥{{ storeInfo.min_order_amount || 30 }}</text>
				</view>
			</view>

			<view class="merchant-section">
				<view class="section-title">食品安全</view>
				<view class="safety-list">
					<view class="safety-item">
						<text class="icon">✓</text>
						<text class="text">商家已签署食品安全承诺书</text>
					</view>
					<view class="safety-item">
						<text class="icon">✓</text>
						<text class="text">商家已缴纳食品安全保证金</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 5. 底部结算栏（始终显示） -->
		<view class="submit-bar">
			<view class="submit-content" @click="cartCount > 0 && (showCart = true)">
				<view class="cart-icon" :class="{ active: cartCount > 0 }">
					<image class="cart-img" src="/static/img/cart.png" />
					<view class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</view>
				</view>
				<view class="price-info">
					<view class="price-row" v-if="cartCount > 0">
						<text class="total">¥{{ cartPrice }}</text>
						<text class="delivery-fee">另需配送费¥{{ storeInfo.delivery_fee || 5 }}</text>
					</view>
					<view class="price-row" v-else>
						<text class="empty-tip">未选购商品</text>
					</view>
				</view>
			</view>
			<button class="submit-btn" :class="{ disabled: !canSubmit }" :disabled="!canSubmit" @click.stop="submitOrder">
				{{ submitBtnText }}
			</button>
		</view>

		<!-- 购物车弹窗 -->
		<view class="cart-popup" v-if="showCart" @click.self="showCart = false">
			<view class="cart-mask"></view>
			<view class="cart-content">
				<view class="cart-header">
					<text class="header-title">已选商品</text>
					<view class="clear-btn" @click="clearCart">
						<uni-icons type="trash" size="16" color="#999" />
						<text>清空</text>
					</view>
				</view>
				<scroll-view class="cart-list" scroll-y>
					<view v-for="(item, index) in cartList" :key="index" class="cart-item">
						<image class="item-img" :src="item.img" mode="aspectFill" />
						<view class="item-info">
							<text class="item-name">{{ item.name }}</text>
							<text class="item-price">¥{{ item.price }}</text>
						</view>
						<view class="item-stepper">
							<view class="btn-minus" @click="decreaseCartItem(index)">
								<text>−</text>
							</view>
							<text class="stepper-num">{{ item.count }}</text>
							<view class="btn-plus" @click="increaseCartItem(index)">
								<text>+</text>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				activeTab: 'menu',
				activeCat: 0,
				sidebarScrollTop: 0,
				goodsScrollTop: 0,
				isClicking: false,
				sectionTops: [],
				showCart: false,
				cartList: [],
				defaultLogo: 'https://picsum.photos/100/100?random=10',
				storeId: null,
				storeInfo: {
					id: 1,
					name: '肯德基宅急送（朝阳大悦城店）',
					logo: 'https://picsum.photos/100/100?random=10',
					monthly_sales: 9999,
					delivery_time: 30,
					delivery_fee: 5,
					min_order_amount: 30,
					business_hours: '09:00-22:00',
					phone: '400-888-8888',
					address: '北京市朝阳区朝阳大悦城B1层',
					notice: '本店新用户首单立减5元，满30元起送，营业时间09:00-22:00，欢迎下单！'
				},

				// 公告滚动速度计算
				noticeDuration: 10,

				categories: [{
						name: '热销推荐',
						goods: [{
								id: 1,
								name: '香辣鸡腿堡套餐',
								desc: '香辣鸡腿堡+中薯条+中可乐',
								price: 29.9,
								original: 45,
								sales: 9999,
								img: 'https://picsum.photos/200/200?random=1'
							},
							{
								id: 2,
								name: '全家桶（5块原味鸡）',
								desc: '5块原味鸡+3对辣翅+土豆泥+可乐',
								price: 69,
								original: 99,
								sales: 8888,
								img: 'https://picsum.photos/200/200?random=2'
							},
							{
								id: 3,
								name: '新奥尔良烤翅（4块）',
								desc: '经典烤翅，鲜嫩多汁',
								price: 19.9,
								original: 28,
								sales: 6666,
								img: 'https://picsum.photos/200/200?random=3'
							},
							{
								id: 4,
								name: '葡式蛋挞（6只）',
								desc: '酥脆挞皮，香滑蛋液',
								price: 25,
								original: 36,
								sales: 5555,
								img: 'https://picsum.photos/200/200?random=4'
							}
						]
					},
					{
						name: '汉堡主食',
						goods: [{
								id: 5,
								name: '老北京鸡肉卷',
								desc: '经典口味，酱香浓郁',
								price: 18.5,
								original: 25,
								sales: 4321,
								img: 'https://picsum.photos/200/200?random=5'
							},
							{
								id: 6,
								name: '劲脆鸡腿堡',
								desc: '大块鸡腿肉，外脆里嫩',
								price: 19,
								original: 26,
								sales: 3456,
								img: 'https://picsum.photos/200/200?random=6'
							},
							{
								id: 7,
								name: '新奥尔良烤鸡腿堡',
								desc: '烤制工艺，健康美味',
								price: 20,
								original: 28,
								sales: 2890,
								img: 'https://picsum.photos/200/200?random=7'
							}
						]
					},
					{
						name: '小食甜品',
						goods: [{
								id: 8,
								name: '薯条（大）',
								desc: '金黄酥脆，停不下来',
								price: 14,
								original: 18,
								sales: 7654,
								img: 'https://picsum.photos/200/200?random=8'
							},
							{
								id: 9,
								name: '鸡米花',
								desc: '粒粒香脆，一口一个',
								price: 12,
								original: 16,
								sales: 6543,
								img: 'https://picsum.photos/200/200?random=9'
							},
							{
								id: 10,
								name: '圣代（草莓/巧克力）',
								desc: '冰爽甜蜜，夏日首选',
								price: 9,
								original: 12,
								sales: 8765,
								img: 'https://picsum.photos/200/200?random=10'
							}
						]
					},
					{
						name: '饮料冷饮',
						goods: [{
								id: 11,
								name: '中杯可乐',
								desc: '冰爽畅快',
								price: 9,
								original: 12,
								sales: 9999,
								img: 'https://picsum.photos/200/200?random=11'
							},
							{
								id: 12,
								name: '九珍果汁',
								desc: '九种水果，维C满满',
								price: 11,
								original: 14,
								sales: 5432,
								img: 'https://picsum.photos/200/200?random=12'
							},
							{
								id: 13,
								name: '雪顶咖啡',
								desc: '咖啡与冰淇淋的完美结合',
								price: 13,
								original: 16,
								sales: 4321,
								img: 'https://picsum.photos/200/200?random=13'
							}
						]
					}
				]
			}
		},

		computed: {
			cartCount() {
				return this.cartList.reduce((sum, item) => sum + item.count, 0)
			},
			cartPrice() {
				return this.cartList.reduce((sum, item) => sum + item.price * item.count, 0).toFixed(1)
			},
			canSubmit() {
				return this.cartCount > 0 && parseFloat(this.cartPrice) >= (this.storeInfo.min_order_amount || 30)
			},
			submitBtnText() {
				if (this.cartCount === 0) return '去结算'
				if (parseFloat(this.cartPrice) < (this.storeInfo.min_order_amount || 30)) {
					return `差¥${((this.storeInfo.min_order_amount || 30) - parseFloat(this.cartPrice)).toFixed(1)}起送`
				}
				return '去结算'
			}
		},

		onLoad(option) {
			console.log(option)
			this.storeId = option.id
			if (!this.storeId) {
				return false
			} else {
				this.getStoreDetail(this.storeId)
			}
			this.calcNoticeDuration()
		},

		onReady() {
			setTimeout(() => {
				this.calcSectionTops()
			}, 100)
		},

		methods: {
			// 计算公告滚动速度
			calcNoticeDuration() {
				const textLength = this.storeInfo.notice?.length || 0
				// 每秒滚动5个字符
				this.noticeDuration = Math.max(8, textLength / 5)
			},

			calcSectionTops() {
				const query = uni.createSelectorQuery().in(this)
				query.select('.goods-list').boundingClientRect()
				this.categories.forEach((_, index) => {
					query.select(`.cat-section:nth-child(${index + 1})`).boundingClientRect()
				})
				query.exec(res => {
					if (!res || !res[0]) return
					const listTop = res[0].top
					this.sectionTops = res.slice(1).map((item) => {
						if (!item) return 0
						return item.top - listTop
					})
				})
			},

			getGoodsCount(goods) {
				const item = this.cartList.find(item => item.id === goods.id)
				return item ? item.count : 0
			},

			increaseGoods(goods) {
				const exist = this.cartList.find(item => item.id === goods.id)
				if (exist) {
					exist.count++
				} else {
					this.cartList.push({
						id: goods.id,
						name: goods.name,
						price: goods.price,
						img: goods.img,
						count: 1
					})
				}
			},

			decreaseGoods(goods) {
				const index = this.cartList.findIndex(item => item.id === goods.id)
				if (index > -1) {
					const item = this.cartList[index]
					if (item.count > 1) {
						item.count--
					} else {
						this.cartList.splice(index, 1)
					}
				}
			},

			clickCategory(index) {
				this.activeCat = index
				this.isClicking = true
				if (this.sectionTops[index] !== undefined) {
					this.goodsScrollTop = this.sectionTops[index]
				}
				this.scrollSidebarToVisible(index)
				setTimeout(() => {
					this.isClicking = false
				}, 500)
			},

			scrollSidebarToVisible(index) {
				const itemHeight = 90
				const visibleHeight = 400
				const scrollPosition = index * itemHeight
				if (scrollPosition > visibleHeight / 2) {
					this.sidebarScrollTop = scrollPosition - visibleHeight / 2
				} else {
					this.sidebarScrollTop = 0
				}
			},

			onGoodsScroll(e) {
				if (this.isClicking) return
				const scrollTop = e.detail.scrollTop
				let currentIndex = 0
				for (let i = 0; i < this.sectionTops.length; i++) {
					if (scrollTop >= this.sectionTops[i] - 50) {
						currentIndex = i
					}
				}
				if (currentIndex >= this.categories.length - 1) {
					currentIndex = this.categories.length - 1
				}
				if (currentIndex !== this.activeCat) {
					this.activeCat = currentIndex
					this.scrollSidebarToVisible(currentIndex)
				}
			},

			increaseCartItem(index) {
				this.cartList[index].count++
			},

			decreaseCartItem(index) {
				const item = this.cartList[index]
				if (item.count > 1) {
					item.count--
				} else {
					this.cartList.splice(index, 1)
				}
			},

			clearCart() {
				uni.showModal({
					title: '提示',
					content: '确定清空购物车吗？',
					success: (res) => {
						if (res.confirm) {
							this.cartList = []
							this.showCart = false
						}
					}
				})
			},

			submitOrder() {
				if (!this.canSubmit) return
				this.$utils.setStorage('cartList', this.cartList)
				this.$utils.setStorage('storeInfo', this.storeInfo)
				uni.navigateTo({
					url: `/pages/order/confirm?storeId=${this.storeInfo.id}&total=${this.cartPrice}`
				})
			},

			callPhone(phone) {
				uni.makePhoneCall({
					phoneNumber: phone
				})
			},
			// 门店详情接口
			async getStoreDetail(storeId) {
				const data = await this.$request.post(this.$apis.index.storeDetail, {
					storeId: storeId
				});
				console.log(data)
				// 更新门店信息
				this.storeInfo = {
					...this.storeInfo, // 保留默认值，接口字段覆盖
					...data.result.storeInfo
				}
				// 更新分类商品信息
				this.categories = data.result.categories.length > 0 ?
					data.result.categories :
					this.categories // 接口返回空时使用默认数据
				// 重新计算公告滚动速度
				this.calcNoticeDuration()
				// 重新计算分类位置
				setTimeout(() => {
					this.calcSectionTops()
				}, 100)
			},
		}
	}
</script>

<style lang="scss" scoped>
	$primary: #ff6b35;

	.store-page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #f5f5f5;
		padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
	}

	// 1. 门店头部
	.store-header {
		flex-shrink: 0;
		background: #fff;

		.header-bg {
			height: 80rpx;
			background: linear-gradient(135deg, $primary 0%, lighten($primary, 15%) 100%);
		}

		.store-info {
			display: flex;
			padding: 0 30rpx 20rpx;
			margin-top: -40rpx;

			.store-logo {
				width: 100rpx;
				height: 100rpx;
				border-radius: 12rpx;
				border: 4rpx solid #fff;
				background: #fff;
			}

			.store-meta {
				flex: 1;
				margin-left: 20rpx;
				display: flex;
				flex-direction: column;
				justify-content: center;

				.store-name {
					font-size: 32rpx;
					font-weight: bold;
					color: #333;
					margin-bottom: 10rpx;
				}

				.store-simple {
					display: flex;
					align-items: center;
					gap: 20rpx;

					.sales,
					.time {
						font-size: 24rpx;
						color: #666;
					}
				}
			}
		}
	}

	// 2. Tab切换
	.tab-bar {
		display: flex;
		background: #fff;
		border-bottom: 1rpx solid #eee;

		.tab-item {
			flex: 1;
			text-align: center;
			padding: 24rpx 0;
			font-size: 28rpx;
			color: #666;
			position: relative;

			&.active {
				color: #333;
				font-weight: bold;

				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 40rpx;
					height: 4rpx;
					background: $primary;
					border-radius: 2rpx;
				}
			}
		}
	}

	// 3. Tab内容区
	.tab-content {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	// 公告横向滚动 - 点餐Tab顶部
	.notice-bar {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		background: #fff8f0;
		padding: 16rpx 20rpx;
		margin: 16rpx;
		border-radius: 12rpx;

		.notice-icon {
			padding: 4rpx 12rpx;
			background: $primary;
			color: #fff;
			font-size: 22rpx;
			border-radius: 6rpx;
			margin-right: 16rpx;
			flex-shrink: 0;
		}

		.notice-scroll {
			flex: 1;
			overflow: hidden;
			height: 40rpx;
			position: relative;

			.notice-content {
				display: flex;
				align-items: center;
				height: 40rpx;
				white-space: nowrap;
				animation: marquee linear infinite;

				.notice-text {
					font-size: 26rpx;
					color: #ff6b35;
					padding-right: 80rpx;
					line-height: 40rpx;
				}
			}
		}
	}

	// 点餐Tab
	.main-content {
		flex: 1;
		height: 100%;
		display: flex;
		overflow: hidden;

		.category-sidebar {
			width: 160rpx;
			height: 100%;
			background: #f8f8f8;

			.cat-item {
				padding: 30rpx 20rpx;
				font-size: 26rpx;
				color: #666;
				text-align: center;
				position: relative;

				&.active {
					background: #fff;
					color: $primary;
					font-weight: bold;

					&::before {
						content: '';
						position: absolute;
						left: 0;
						top: 50%;
						transform: translateY(-50%);
						width: 6rpx;
						height: 40rpx;
						background: $primary;
					}
				}
			}
		}

		.goods-list {
			flex: 1;
			height: 100%;
			background: #fff;

			.cat-section {
				padding: 20rpx;

				.cat-title {
					font-size: 28rpx;
					font-weight: bold;
					color: #333;
					margin-bottom: 20rpx;
					padding-left: 16rpx;
					border-left: 6rpx solid $primary;
				}
			}

			.goods-item {
				display: flex;
				margin-bottom: 30rpx;

				.goods-img {
					width: 180rpx;
					height: 180rpx;
					border-radius: 12rpx;
					flex-shrink: 0;
				}

				.goods-info {
					flex: 1;
					margin-left: 20rpx;
					display: flex;
					flex-direction: column;
					justify-content: space-between;

					.goods-name {
						font-size: 30rpx;
						font-weight: bold;
						color: #333;
					}

					.goods-desc {
						font-size: 24rpx;
						color: #999;
					}

					.goods-sales {
						font-size: 24rpx;
						color: #999;
					}

					.goods-bottom {
						display: flex;
						justify-content: space-between;
						align-items: center;

						.price-box {
							.price-symbol {
								font-size: 24rpx;
								color: $primary;
							}

							.price-value {
								font-size: 36rpx;
								font-weight: bold;
								color: $primary;
							}

							.price-original {
								margin-left: 10rpx;
								font-size: 24rpx;
								color: #999;
								text-decoration: line-through;
							}
						}

						.stepper {
							display: flex;
							align-items: center;

							.btn-minus {
								width: 44rpx;
								height: 44rpx;
								border: 2rpx solid #e0e0e0;
								border-radius: 50%;
								display: flex;
								align-items: center;
								justify-content: center;
								background: #fff;

								.minus-icon {
									font-size: 28rpx;
									color: #666;
								}
							}

							.stepper-num {
								min-width: 50rpx;
								text-align: center;
								font-size: 28rpx;
								color: #333;
								font-weight: bold;
							}

							.btn-plus {
								width: 44rpx;
								height: 44rpx;
								background: $primary;
								border-radius: 50%;
								display: flex;
								align-items: center;
								justify-content: center;

								.plus-icon {
									font-size: 28rpx;
									color: #fff;
									font-weight: bold;
								}
							}
						}
					}
				}
			}

			.bottom-placeholder {
				height: 40rpx;
			}
		}
	}

	// 商家Tab
	.merchant-content {
		padding: 20rpx;
		overflow-y: auto;

		.merchant-section {
			background: #fff;
			border-radius: 12rpx;
			padding: 24rpx;
			margin-bottom: 20rpx;

			.section-title {
				font-size: 30rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 20rpx;
				padding-bottom: 16rpx;
				border-bottom: 1rpx solid #f0f0f0;
			}

			.info-item {
				display: flex;
				padding: 16rpx 0;

				.label {
					width: 160rpx;
					font-size: 26rpx;
					color: #999;
					flex-shrink: 0;
				}

				.value {
					flex: 1;
					font-size: 26rpx;
					color: #333;

					&.phone {
						color: $primary;
					}
				}
			}

			.safety-list {
				.safety-item {
					display: flex;
					align-items: center;
					padding: 12rpx 0;

					.icon {
						width: 32rpx;
						height: 32rpx;
						background: #52c41a;
						color: #fff;
						font-size: 20rpx;
						border-radius: 50%;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-right: 16rpx;
					}

					.text {
						font-size: 26rpx;
						color: #666;
					}
				}
			}
		}
	}

	@keyframes marquee {
		0% {
			transform: translateX(0);
		}

		100% {
			transform: translateX(-50%);
		}
	}

	// 底部结算栏（始终显示）
	.submit-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 100rpx;
		background: #fff;
		border-top: 1rpx solid #e5e5e5;
		display: flex;
		align-items: center;
		padding: 0 24rpx;
		padding-bottom: env(safe-area-inset-bottom);
		z-index: 100;

		.submit-content {
			flex: 1;
			display: flex;
			align-items: center;
			height: 100%;
		}

		.cart-icon {
			position: relative;
			width: 80rpx;
			height: 80rpx;
			margin-right: 20rpx;

			.cart-img {
				width: 100%;
				height: 100%;
				opacity: 0.4;
			}

			&.active {
				.cart-img {
					opacity: 1;
				}
			}

			.cart-badge {
				position: absolute;
				top: -8rpx;
				right: -8rpx;
				min-width: 36rpx;
				height: 36rpx;
				padding: 0 10rpx;
				background: #ff4d4f;
				color: #fff;
				font-size: 22rpx;
				border-radius: 18rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}

		.price-info {
			flex: 1;

			.price-row {
				display: flex;
				align-items: baseline;

				.total {
					font-size: 40rpx;
					color: #333;
					font-weight: bold;
				}

				.delivery-fee {
					margin-left: 16rpx;
					font-size: 24rpx;
					color: #999;
				}

				.empty-tip {
					font-size: 28rpx;
					color: #999;
				}
			}
		}

		.submit-btn {
			min-width: 180rpx;
			height: 72rpx;
			padding: 0 32rpx;
			margin: 0;
			margin-left: 20rpx;
			background: $primary;
			color: #fff;
			font-size: 28rpx;
			font-weight: bold;
			border-radius: 36rpx;
			border: none;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;

			&.disabled {
				background: #ccc;
				color: #fff;
			}

			&:active {
				opacity: 0.9;
			}
		}
	}

	// 购物车弹窗
	.cart-popup {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		z-index: 999;

		.cart-mask {
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.5);
		}

		.cart-content {
			position: absolute;
			left: 0;
			right: 0;
			bottom: 100rpx;
			background: #fff;
			border-radius: 20rpx 20rpx 0 0;
			max-height: 60vh;
			display: flex;
			flex-direction: column;

			.cart-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 30rpx;
				border-bottom: 1rpx solid #eee;

				.header-title {
					font-size: 30rpx;
					font-weight: bold;
					color: #333;
				}

				.clear-btn {
					display: flex;
					align-items: center;
					font-size: 26rpx;
					color: #999;

					text {
						margin-left: 8rpx;
					}
				}
			}

			.cart-list {
				flex: 1;
				overflow-y: auto;
				padding: 0 30rpx;

				.cart-item {
					display: flex;
					align-items: center;
					padding: 20rpx 0;
					border-bottom: 1rpx solid #f5f5f5;

					.item-img {
						width: 100rpx;
						height: 100rpx;
						border-radius: 8rpx;
						margin-right: 20rpx;
					}

					.item-info {
						flex: 1;

						.item-name {
							font-size: 28rpx;
							color: #333;
							margin-bottom: 8rpx;
						}

						.item-price {
							font-size: 28rpx;
							color: $primary;
							font-weight: bold;
						}
					}

					.item-stepper {
						display: flex;
						align-items: center;

						.btn-minus,
						.btn-plus {
							width: 48rpx;
							height: 48rpx;
							border-radius: 50%;
							display: flex;
							align-items: center;
							justify-content: center;
							font-size: 28rpx;
						}

						.btn-minus {
							border: 2rpx solid #e0e0e0;
							color: #666;
						}

						.btn-plus {
							background: $primary;
							color: #fff;
						}

						.stepper-num {
							min-width: 60rpx;
							text-align: center;
							font-size: 28rpx;
							color: #333;
						}
					}
				}
			}
		}
	}
</style>