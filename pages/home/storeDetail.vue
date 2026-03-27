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
 			<view class="notice-bar" v-if="storeInfo.notice">
 				<view class="notice-icon">公告</view>
 				<view class="notice-scroll">
 					<view class="notice-content" :class="{ marquee: needMarquee }" :style="{ animationDuration: noticeDuration + 's' }">
 						<text class="notice-text">{{ storeInfo.notice }}</text>
 						<text class="notice-text" v-if="needMarquee">{{ storeInfo.notice }}</text>
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
 						<view v-for="(goods, gIndex) in cat.goods" :key="gIndex" class="goods-item" @click="goToDetail(goods)">
 							<image class="goods-img" :src="goods.img" mode="aspectFill" />
 							<view class="goods-info" @click.stop>
 								<view class="goods-name">{{ goods.name }}</view>
 								<view class="goods-sales">月售 {{ goods.sales }}</view>
 								<view class="goods-bottom">
 									<view class="price-box">
 										<text class="price-symbol">¥</text>
 										<text class="price-value">{{ goods.defaultSpec.price }}</text>
 									</view>
 									<!-- 多规格显示加减按钮（和单规格一样） -->
 									<view class="stepper" v-if="hasSpecs(goods)">
 										<!-- 已选过规格，显示数量加减 -->
 										<template v-if="getSpecGoodsCount(goods) > 0">
 											<view class="btn-minus" @click.stop="decreaseSpecGoods(goods)">
 												<text class="minus-icon">−</text>
 											</view>
 											<text class="stepper-num">{{ getSpecGoodsCount(goods) }}</text>
 											<view class="btn-plus" @click.stop="openSpec(goods, true)">
 												<text class="plus-icon">+</text>
 											</view>
 										</template>
 										<!-- 未选过，显示选规格按钮 -->
 										<template v-else>
 											<view class="btn-select-spec" @click.stop="openSpec(goods, false)">
 												选规格
 											</view>
 										</template>
 									</view>
 									<!-- 单规格显示加减按钮 -->
 									<view class="stepper" v-else>
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
 					<view class="bottom-placeholder"></view>
 				</scroll-view>
 			</view>
 		</view>
 
 		<!-- 4. 商家Tab -->
 		<view class="tab-content merchant-content" v-show="activeTab === 'merchant'">
 			<view class="merchant-card">
 				<view class="merchant-title">
 					<text class="title-text">商家信息</text>
 				</view>
 				<view class="info-row">
 					<text class="label">商家名称</text>
 					<text class="value">{{ storeInfo.name }}</text>
 				</view>
 				<view class="info-row">
 					<text class="label">营业时间</text>
 					<text class="value">{{ storeInfo.business_hours || '09:00-22:00' }}</text>
 				</view>
 				<view class="info-row">
 					<text class="label">联系电话</text>
 					<text class="value phone" @click="callPhone(storeInfo.phone)">{{ storeInfo.phone || '400-888-8888' }}</text>
 				</view>
 				<view class="info-row">
 					<text class="label">商家地址</text>
 					<text class="value">{{ storeInfo.address }}</text>
 				</view>
 			</view>
 
 			<view class="merchant-card">
 				<view class="merchant-title">
 					<text class="title-text">配送信息</text>
 				</view>
 				<view class="info-row">
 					<text class="label">配送方式</text>
 					<text class="value">商家配送</text>
 				</view>
 				<view class="info-row">
 					<text class="label">配送时间</text>
 					<text class="value">{{ storeInfo.delivery_time || 30 }} 分钟</text>
 				</view>
 				<view class="info-row">
 					<text class="label">配送费用</text>
 					<text class="value">¥{{ storeInfo.delivery_fee || 5 }}</text>
 				</view>
 				<view class="info-row">
 					<text class="label">起送价格</text>
 					<text class="value">¥{{ storeInfo.min_order_amount || 30 }}</text>
 				</view>
 			</view>
 		</view>
 
 		<!-- 底部结算栏 -->
 		<view class="submit-bar" :class="{ 'cart-open': showCart }">
 			<!-- 购物车展开时的遮罩 -->
 			<view class="cart-overlay" v-if="showCart" @click="toggleCart"></view>
 			
 			<!-- 购物车弹窗 -->
 			<view class="cart-popup-taobao" v-if="showCart">
 				<view class="cart-header">
 					<view class="cart-header-left">
 						<text class="header-title">已选商品</text>
 						<text class="cart-total">共{{ cartCount }}件</text>
 					</view>
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
 							<text class="item-spec" v-if="item.specText">{{ item.specText }}</text>
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
 
 			<!-- 结算栏主体 -->
 			<view class="submit-content" @click="toggleCart">
 				<view class="cart-icon" :class="{ active: cartCount > 0 }">
 					<image class="cart-img" src="/static/img/cart.png" />
 					<view class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</view>
 				</view>
 				<view class="price-info">
 					<view class="price-row" v-if="cartCount > 0">
 						<text class="total">¥{{ cartPrice }}</text>
 						<text class="delivery-fee">配送费¥{{ storeInfo.delivery_fee || 5 }}</text>
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
 
 		<!-- 规格选择弹窗 -->
 		<view class="spec-popup" v-if="showSpecPopup">
 			<view class="mask" @click="closeSpecPopup"></view>
 			<view class="spec-content">
 				<view class="spec-header">
 					<image class="good-img" :src="currentGood ? currentGood.img : ''" mode="aspectFill" />
 					<view class="good-info">
 						<view class="good-name">{{ currentGood ? currentGood.name : '' }}</view>
 						<view class="good-price">¥{{ currentPrice }}</view>
 						<view class="selected-info-header" v-if="selectedSpecText">
 							<text class="selected-label">已选：</text>
 							<text class="selected-text">{{ selectedSpecText }}</text>
 						</view>
 					</view>
 					<view class="close-btn" @click="closeSpecPopup">×</view>
 				</view>
 
 				<scroll-view class="spec-body" scroll-y>
 					<view class="attr-group" v-for="(group, gIndex) in attrGroupList" :key="gIndex">
 						<view class="attr-title">{{ group.attrName }}</view>
 						<view class="option-list">
 							<view
 								class="option-item"
 								:class="{ active: selectedOptions[group.attrId] === opt.optionId }"
 								v-for="(opt, oIndex) in group.options"
 								:key="oIndex"
 								@click="selectOption(group.attrId, opt.optionId)"
 							>
 								{{ opt.optionName }}
 							</view>
 						</view>
 					</view>
 				</scroll-view>
 
 				<view class="spec-footer">
 					<button class="confirm-btn" @click="confirmAddCart">
 						加入购物车 ¥{{ currentPrice }}
 					</button>
 				</view>
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
 				storeInfo: {},
 				noticeDuration: 10,
 				needMarquee: false,
 				categories: [],
 
 				// 规格弹窗
 				showSpecPopup: false,
 				currentGood: null,
 				selectedOptions: {},
 				attrGroupList: [],
 				currentPrice: 0
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
 			},
 			selectedSpecText() {
 				if (!this.attrGroupList.length) return ''
 				const texts = []
 				for (const group of this.attrGroupList) {
 					const selectedOptionId = this.selectedOptions[group.attrId]
 					if (selectedOptionId) {
 						const opt = group.options.find(o => o.optionId === selectedOptionId)
 						if (opt) texts.push(opt.optionName)
 					}
 				}
 				return texts.join('，')
 			}
 		},
 
 		onLoad(option) {
 			this.storeId = option.id
 			if (this.storeId) this.getStoreDetail(this.storeId)
 			this.calcNoticeDuration()
 		},
 
 		onReady() {
 			setTimeout(() => this.calcSectionTops(), 100)
 		},
 
 		methods: {
 			calcNoticeDuration() {
 				const len = this.storeInfo.notice?.length || 0
 				this.needMarquee = len > 35
 				this.noticeDuration = Math.max(8, len / 5)
 			},
 
 			calcSectionTops() {
 				const query = uni.createSelectorQuery().in(this)
 				query.select('.goods-list').boundingClientRect()
 				this.categories.forEach((_, i) => {
 					query.select(`.cat-section:nth-child(${i + 1})`).boundingClientRect()
 				})
 				query.exec(res => {
 					if (!res || !res[0]) return
 					const t = res[0].top
 					this.sectionTops = res.slice(1).map(i => i ? i.top - t : 0)
 				})
 			},
 
 			// 判断商品是否有多规格
 			hasSpecs(goods) {
 				return goods.defaultSpec?.attrs && goods.defaultSpec.attrs.length > 0
 			},
 
 			// 获取单规格商品在购物车中的数量
 			getGoodsCount(goods) {
 				const item = this.cartList.find(i => i.productId === goods.productId && !i.specText)
 				return item ? item.count : 0
 			},
 
 			// 获取多规格商品在购物车中的总数量
 			getSpecGoodsCount(goods) {
 				const items = this.cartList.filter(i => i.productId === goods.productId)
 				return items.reduce((sum, item) => sum + item.count, 0)
 			},
 
 			// 减少多规格商品数量
 			decreaseSpecGoods(goods) {
 				// 找到该商品的最后一个购物车项
 				const items = this.cartList.filter(i => i.productId === goods.productId)
 				if (items.length === 0) return
 				
 				// 找到最后一个加入的项的索引
 				const lastIndex = this.cartList.findLastIndex(i => i.productId === goods.productId)
 				if (lastIndex < 0) return
 				
 				const item = this.cartList[lastIndex]
 				if (item.count > 1) {
 					item.count--
 				} else {
 					this.cartList.splice(lastIndex, 1)
 				}
 			},
 
 			// 打开规格弹窗
 			openSpec(goods, isAddMode = false) {
 				this.currentGood = goods
 				this.currentPrice = goods.defaultSpec?.price || 0
 				this.attrGroupList = this.buildAttrGroups(goods.defaultSpec?.attrs || [])
 				this.selectedOptions = {}
 				
 				// 默认选中每个属性的第一个选项
 				this.attrGroupList.forEach(group => {
 					if (group.options && group.options.length > 0) {
 						this.$set(this.selectedOptions, group.attrId, group.options[0].optionId)
 					}
 				})
 				
 				this.calcPrice()
 				this.showSpecPopup = true
 			},
 
 			// 关闭规格弹窗
 			closeSpecPopup() {
 				this.showSpecPopup = false
 				this.currentGood = null
 				this.selectedOptions = {}
 				this.attrGroupList = []
 			},
 
 			// 构建规格组
 			buildAttrGroups(attrs) {
 				if (!attrs || !Array.isArray(attrs)) return []
 				const map = {}
 				attrs.forEach(a => {
 					if (!map[a.attrId]) {
 						map[a.attrId] = {
 							attrId: a.attrId,
 							attrName: a.attrName,
 							options: []
 						}
 					}
 					const exist = map[a.attrId].options.find(o => o.optionId === a.optionId)
 					if (!exist) {
 						map[a.attrId].options.push({
 							optionId: a.optionId,
 							optionName: a.optionName
 						})
 					}
 				})
 				return Object.values(map)
 			},
 
 			// 选择规格选项
 			selectOption(attrId, optionId) {
 				this.$set(this.selectedOptions, attrId, optionId)
 				this.calcPrice()
 			},
 
 			// 计算价格
 			calcPrice() {
 				if (this.currentGood && this.currentGood.defaultSpec) {
 					this.currentPrice = this.currentGood.defaultSpec.price
 				}
 			},
 
 			// 确认加入购物车
 			confirmAddCart() {
 				if (!this.currentGood) return
 				
 				const specText = this.selectedSpecText
 				
 				// 查找是否已存在相同规格的商品
 				const existIndex = this.cartList.findIndex(i => 
 					i.productId === this.currentGood.productId && 
 					i.specText === specText
 				)
 				
 				if (existIndex >= 0) {
 					// 已存在相同规格，数量+1
 					this.cartList[existIndex].count++
 				} else {
 					// 新增规格项
 					this.cartList.push({
 						productId: this.currentGood.productId,
 						name: this.currentGood.name,
 						img: this.currentGood.img,
 						price: this.currentPrice,
 						specId: this.currentGood.defaultSpec?.specId,
 						specText: specText,
 						selectedOptions: { ...this.selectedOptions },
 						count: 1
 					})
 				}
 				
 				this.closeSpecPopup()
 			},
 
 			toggleCart() {
 				if (this.cartCount === 0) return
 				this.showCart = !this.showCart
 			},
 
 			increaseGoods(goods) {
 				if (this.hasSpecs(goods)) {
 					this.openSpec(goods, true)
 					return
 				}
 				this.addCart(goods, goods.defaultSpec, '')
 			},
 
 			decreaseGoods(goods) {
 				const idx = this.cartList.findIndex(i => i.productId === goods.productId && !i.specText)
 				if (idx < 0) return
 				const item = this.cartList[idx]
 				item.count > 1 ? item.count-- : this.cartList.splice(idx, 1)
 			},
 
 			addCart(goods, spec, specText) {
 				const exist = this.cartList.find(i =>
 					i.productId === goods.productId && i.specId === spec.specId && i.specText === specText
 				)
 				if (exist) {
 					exist.count++
 				} else {
 					this.cartList.push({
 						productId: goods.productId,
 						name: goods.name,
 						img: goods.img,
 						price: spec.price,
 						specId: spec.specId,
 						specText: specText,
 						count: 1
 					})
 				}
 			},
 
 			// 跳转到商品详情
 			goToDetail(goods) {
 				uni.navigateTo({
 					url: `/pages/goods/detail?id=${goods.productId}&storeId=${this.storeId}`
 				})
 			},
 
 			clickCategory(index) {
 				this.activeCat = index
 				this.isClicking = true
 				this.goodsScrollTop = this.sectionTops[index] || 0
 				this.scrollSidebar(index)
 				setTimeout(() => this.isClicking = false, 500)
 			},
 
 			scrollSidebar(index) {
 				const h = 90, vh = 400
 				const pos = index * h
 				this.sidebarScrollTop = pos > vh / 2 ? pos - vh / 2 : 0
 			},
 
 			onGoodsScroll(e) {
 				if (this.isClicking) return
 				const top = e.detail.scrollTop
 				let curr = 0
 				for (let i = 0; i < this.sectionTops.length; i++) {
 					if (top >= this.sectionTops[i] - 50) curr = i
 				}
 				if (curr !== this.activeCat) {
 					this.activeCat = curr
 					this.scrollSidebar(curr)
 				}
 			},
 
 			increaseCartItem(index) {
 				this.cartList[index].count++
 			},
 
 			decreaseCartItem(index) {
 				const item = this.cartList[index]
 				item.count > 1 ? item.count-- : this.cartList.splice(index, 1)
 				if (this.cartList.length === 0) {
 					this.showCart = false
 				}
 			},
 
 			clearCart() {
 				uni.showModal({
 					title: '清空购物车',
 					content: '确定清空吗？',
 					success: res => {
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
 				uni.makePhoneCall({ phoneNumber: phone })
 			},
 
 			async getStoreDetail(storeId) {
 				const { result } = await this.$request.post(this.$apis.index.storeDetail, { storeId })
 				this.storeInfo = { ...this.storeInfo, ...result.storeInfo }
 				this.categories = result.categories || []
 				this.calcNoticeDuration()
 				setTimeout(() => this.calcSectionTops(), 100)
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
 
 	.store-header {
 		flex-shrink: 0;
 		background: #fff;
 		.header-bg {
 			height: 80rpx;
 			background: linear-gradient(135deg, $primary 0%, #ff8c5a 100%);
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
 					.sales,.time {
 						font-size: 24rpx;
 						color: #666;
 					}
 				}
 			}
 		}
 	}
 
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
 
 	.tab-content {
 		flex: 1;
 		overflow: hidden;
 		display: flex;
 		flex-direction: column;
 	}
 
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
 			.notice-content {
 				display: flex;
 				align-items: center;
 				height: 40rpx;
 				white-space: nowrap;
 				.notice-text {
 					font-size: 26rpx;
 					color: #ff6b35;
 					padding-right: 20rpx;
 				}
 			}
 			.notice-content.marquee {
 				animation: marquee linear infinite;
 			}
 		}
 	}
 
 	.main-content {
 		flex: 1;
 		height: 100%;
 		display: flex;
 		overflow: hidden;
 		.category-sidebar {
 			width: 160rpx;
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
 						font-size: 28rpx;
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
 								font-size: 32rpx;
 								font-weight: bold;
 								color: $primary;
 							}
 						}
 						.stepper {
 							display: flex;
 							align-items: center;
 							// 选规格按钮
 							.btn-select-spec {
 								padding: 8rpx 20rpx;
 								background: #ff6b35;
 								color: #fff;
 								font-size: 24rpx;
 								font-weight: bold;
 								border-radius: 8rpx;
 								min-width: 80rpx;
 								text-align: center;
 							}
 							.btn-minus {
 								width: 44rpx;
 								height: 44rpx;
 								border: 2rpx solid #e0e0e0;
 								border-radius: 50%;
 								display: flex;
 								align-items: center;
 								justify-content: center;
 								.minus-icon {
 									font-size: 28rpx;
 									color: #666;
 								}
 							}
 							.stepper-num {
 								min-width: 50rpx;
 								text-align: center;
 								font-size: 28rpx;
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
 								}
 							}
 						}
 					}
 				}
 			}
 			.bottom-placeholder { height: 40rpx; }
 		}
 	}
 
 	/* 商家页面 */
 	.merchant-content {
 		padding: 20rpx;
 		overflow-y: auto;
 		background: #f5f5f5;
 		.merchant-card {
 			background: #fff;
 			border-radius: 16rpx;
 			padding: 30rpx;
 			margin-bottom: 20rpx;
 			.merchant-title {
 				font-size: 30rpx;
 				font-weight: bold;
 				color: #333;
 				margin-bottom: 24rpx;
 				padding-bottom: 16rpx;
 				border-bottom: 1rpx solid #f3f3f3;
 			}
 			.info-row {
 				display: flex;
 				padding: 20rpx 0;
 				font-size: 26rpx;
 				.label {
 					width: 150rpx;
 					color: #999;
 					flex-shrink: 0;
 				}
 				.value {
 					flex: 1;
 					color: #333;
 					&.phone {
 						color: $primary;
 					}
 				}
 			}
 		}
 	}
 
 	@keyframes marquee {
 		0% { transform: translateX(0); }
 		100% { transform: translateX(-50%); }
 	}
 
 	/* 底部结算栏 */
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
 		
 		.cart-overlay {
 			position: fixed;
 			left: 0;
 			right: 0;
 			top: 0;
 			bottom: 100rpx;
 			background: rgba(0, 0, 0, 0.5);
 			z-index: -1;
 		}
 		
 		.cart-popup-taobao {
 			position: absolute;
 			left: 0;
 			right: 0;
 			bottom: 100rpx;
 			background: #fff;
 			border-radius: 20rpx 20rpx 0 0;
 			max-height: 60vh;
 			box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.1);
 			animation: slideUpCart 0.3s ease-out;
 			
 			.cart-header {
 				display: flex;
 				justify-content: space-between;
 				align-items: center;
 				padding: 30rpx;
 				border-bottom: 1rpx solid #eee;
 				
 				.cart-header-left {
 					display: flex;
 					align-items: center;
 					gap: 16rpx;
 					
 					.header-title {
 						font-size: 30rpx;
 						font-weight: bold;
 						color: #333;
 					}
 					
 					.cart-total {
 						font-size: 24rpx;
 						color: #999;
 					}
 				}
 				
 				.clear-btn {
 					display: flex;
 					align-items: center;
 					gap: 8rpx;
 					font-size: 24rpx;
 					color: #999;
 				}
 			}
 			
 			.cart-list {
 				padding: 0 30rpx;
 				max-height: 50vh;
 				
 				.cart-item {
 					display: flex;
 					align-items: center;
 					padding: 24rpx 0;
 					border-bottom: 1rpx solid #f5f5f5;
 					
 					.item-img {
 						width: 100rpx;
 						height: 100rpx;
 						border-radius: 8rpx;
 						margin-right: 20rpx;
 					}
 					
 					.item-info {
 						flex: 1;
 						display: flex;
 						flex-direction: column;
 						gap: 8rpx;
 						
 						.item-name {
 							font-size: 28rpx;
 							color: #333;
 							font-weight: bold;
 						}
 						
 						.item-spec {
 							font-size: 24rpx;
 							color: #999;
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
 						gap: 16rpx;
 						
 						.btn-minus, .btn-plus {
 							width: 48rpx;
 							height: 48rpx;
 							border-radius: 50%;
 							display: flex;
 							align-items: center;
 							justify-content: center;
 							font-size: 32rpx;
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
 							min-width: 40rpx;
 							text-align: center;
 							font-size: 28rpx;
 							font-weight: bold;
 						}
 					}
 				}
 			}
 		}
 		
 		.submit-content {
 			flex: 1;
 			display: flex;
 			align-items: center;
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
 			
 			&.active .cart-img {
 				opacity: 1;
 			}
 			
 			.cart-badge {
 				position: absolute;
 				top: -8rpx;
 				right: -8rpx;
 				min-width: 36rpx;
 				height: 36rpx;
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
 				gap: 16rpx;
 				
 				.total {
 					font-size: 40rpx;
 					font-weight: bold;
 					color: #333;
 				}
 				
 				.delivery-fee {
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
 			background: $primary;
 			color: #fff;
 			font-size: 28rpx;
 			font-weight: bold;
 			border-radius: 36rpx;
 			border: none;
 			
 			&.disabled {
 				background: #ccc;
 			}
 		}
 	}
 
 	/* 规格弹窗 */
 	.spec-popup {
 		position: fixed;
 		z-index: 9999;
 		left: 0;
 		right: 0;
 		top: 0;
 		bottom: 0;
 		display: flex;
 		flex-direction: column;
 		justify-content: flex-end;
 		
 		.mask {
 			position: absolute;
 			left: 0;
 			right: 0;
 			top: 0;
 			bottom: 0;
 			background: rgba(0, 0, 0, 0.6);
 		}
 		
 		.spec-content {
 			position: relative;
 			background: #fff;
 			border-radius: 24rpx 24rpx 0 0;
 			max-height: 85vh;
 			margin-bottom: 0;
 			display: flex;
 			flex-direction: column;
 			animation: slideUp 0.3s ease-out;
 			
 			.spec-header {
 				display: flex;
 				align-items: flex-start;
 				padding: 30rpx;
 				position: relative;
 				flex-shrink: 0;
 				
 				.good-img {
 					width: 140rpx;
 					height: 140rpx;
 					border-radius: 12rpx;
 					margin-right: 20rpx;
 					flex-shrink: 0;
 				}
 				
 				.good-info {
 					flex: 1;
 					min-width: 0;
 					display: flex;
 					flex-direction: column;
 					
 					.good-name {
 						font-size: 30rpx;
 						font-weight: bold;
 						color: #333;
 						margin-bottom: 12rpx;
 						line-height: 1.4;
 					}
 					
 					.good-price {
 						font-size: 36rpx;
 						color: #ff4d4f;
 						font-weight: bold;
 						margin-bottom: 12rpx;
 					}
 					
 					.selected-info-header {
 						display: flex;
 						align-items: center;
 						font-size: 24rpx;
 						
 						.selected-label {
 							color: #999;
 							flex-shrink: 0;
 						}
 						
 						.selected-text {
 							color: #333;
 							flex: 1;
 							margin-left: 8rpx;
 						}
 					}
 				}
 				
 				.close-btn {
 					position: absolute;
 					right: 30rpx;
 					top: 30rpx;
 					width: 48rpx;
 					height: 48rpx;
 					display: flex;
 					align-items: center;
 					justify-content: center;
 					font-size: 40rpx;
 					color: #999;
 					z-index: 10;
 				}
 			}
 			
 			.spec-body {
 				flex: 1;
 				overflow: hidden;
 				padding: 0 30rpx;
 				max-height: 45vh;
 				
 				.attr-group {
 					margin-bottom: 30rpx;
 					
 					.attr-title {
 						font-size: 28rpx;
 						font-weight: bold;
 						color: #333;
 						margin-bottom: 20rpx;
 					}
 					
 					.option-list {
 						display: flex;
 						flex-wrap: wrap;
 						gap: 16rpx;
 						
 						.option-item {
 							padding: 16rpx 32rpx;
 							background: #f5f5f5;
 							border-radius: 8rpx;
 							font-size: 26rpx;
 							color: #333;
 							border: 2rpx solid transparent;
 							
 							&.active {
 								background: #fff0f0;
 								color: #ff4d4f;
 								border-color: #ff4d4f;
 							}
 						}
 					}
 				}
 			}
 			
 			.spec-footer {
 				flex-shrink: 0;
 				padding: 20rpx 30rpx;
 				padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
 				border-top: 1rpx solid #eee;
 				
 				.confirm-btn {
 					width: 100%;
 					height: 88rpx;
 					background: linear-gradient(135deg, #ff6b35 0%, #ff4d4f 100%);
 					color: #fff;
 					font-size: 30rpx;
 					font-weight: bold;
 					border-radius: 44rpx;
 					border: none;
 					display: flex;
 					align-items: center;
 					justify-content: center;
 				}
 			}
 		}
 	}
 	
 	@keyframes slideUp {
 		from { transform: translateY(100%); }
 		to { transform: translateY(0); }
 	}
 	
 	@keyframes slideUpCart {
 		from { transform: translateY(100%); opacity: 0; }
 		to { transform: translateY(0); opacity: 1; }
 	}
 </style>
