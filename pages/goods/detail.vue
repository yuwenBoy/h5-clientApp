 <template>
 	<view class="goods-detail-page">
 		<!-- 商品图片 -->
 		<view class="goods-image-wrap">
 			<swiper class="goods-swiper" :indicator-dots="true" :autoplay="false">
 				<swiper-item v-for="(img, index) in goodsImages" :key="index">
 					<image class="goods-image" :src="img" mode="aspectFill" />
 				</swiper-item>
 			</swiper>
 		</view>
 
 		<!-- 商品信息 -->
 		<view class="goods-info-card">
 			<view class="price-row">
 				<text class="price-symbol">¥</text>
 				<text class="price-value">{{ currentPrice }}</text>
 				<text class="price-original" v-if="goodsDetail.original">¥{{ goodsDetail.original }}</text>
 			</view>
 			<view class="goods-name">{{ goodsDetail.name || '' }}</view>
 			<view class="goods-desc" v-if="goodsDetail.desc">{{ goodsDetail.desc }}</view>
 			<view class="goods-sales">月售 {{ goodsDetail.sales || 0 }} · 好评率 98%</view>
 		</view>
 
 		<!-- 规格选择 -->
 		<view class="spec-card" v-if="hasSpecs" @click="openSpecPopup">
 			<view class="spec-label">选择</view>
 			<view class="spec-value">{{ selectedSpecText || '请选择规格' }}</view>
 			<text class="arrow-icon">›</text>
 		</view>
 
 		<!-- 商品详情 -->
 		<view class="detail-card">
 			<view class="detail-title">商品详情</view>
 			<view class="detail-content">
 				<view v-if="goodsDetail.detail" v-html="goodsDetail.detail"></view>
 				<view v-else class="empty-detail">暂无详情</view>
 			</view>
 		</view>
 
 		<!-- 底部占位 -->
 		<view class="bottom-placeholder"></view>
 
 		<!-- 底部操作栏 -->
 		<view class="bottom-bar">
 			<view class="shop-info" @click="backToShop">
 				<view class="icon-wrap">
 					<text class="iconfont icon-shop">🏪</text>
 				</view>
 				<text class="icon-text">进店</text>
 			</view>
 			<view class="cart-info" @click="goToCart">
 				<view class="icon-wrap">
 					<text class="iconfont icon-cart">🛒</text>
 					<view class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</view>
 				</view>
 				<text class="icon-text">购物车</text>
 			</view>
 			<view class="action-btns">
 				<view class="btn-add-cart" @click="addToCart">加入购物车</view>
 				<view class="btn-buy" @click="buyNow">立即购买</view>
 			</view>
 		</view>
 
 		<!-- 规格弹窗 -->
 		<view class="spec-popup" v-if="showSpecPopup">
 			<view class="mask" @click="closeSpecPopup"></view>
 			<view class="spec-content">
 				<view class="spec-header">
 					<image class="good-img" :src="goodsDetail.img || ''" mode="aspectFill" />
 					<view class="good-info">
 						<view class="good-price">¥{{ currentPrice }}</view>
 						<view class="good-stock">库存 {{ goodsDetail.stock || 0 }}件</view>
 						<view class="selected-text" v-if="selectedSpecText">已选：{{ selectedSpecText }}</view>
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
 					<button class="confirm-btn" @click="confirmSpec">确定</button>
 				</view>
 			</view>
 		</view>
 	</view>
 </template>
 
 <script>
 export default {
 	data() {
 		return {
 			goodsId: null,
 			storeId: null,
 			goodsDetail: {
 				name: '',
 				price: 0,
 				original: 0,
 				sales: 0,
 				stock: 0,
 				img: '',
 				images: [],
 				desc: '',
 				detail: '',
 				defaultSpec: null
 			},
 			showSpecPopup: false,
 			selectedOptions: {},
 			attrGroupList: [],
 			currentPrice: 0,
 			cartList: []
 		}
 	},
 	computed: {
 		// 商品图片列表
 		goodsImages() {
 			if (this.goodsDetail.images && this.goodsDetail.images.length > 0) {
 				return this.goodsDetail.images
 			}
 			if (this.goodsDetail.img) {
 				return [this.goodsDetail.img]
 			}
 			return ['https://picsum.photos/400/400?random=1']
 		},
 		// 是否有规格
 		hasSpecs() {
 			return this.goodsDetail.defaultSpec?.attrs?.length > 0
 		},
 		// 已选规格文本
 		selectedSpecText() {
 			if (!this.attrGroupList.length) return ''
 			const texts = []
 			for (const group of this.attrGroupList) {
 				const selected = this.selectedOptions[group.attrId]
 				if (selected) {
 					const opt = group.options.find(o => o.optionId === selected)
 					if (opt) texts.push(opt.optionName)
 				}
 			}
 			return texts.join('，')
 		},
 		// 购物车数量
 		cartCount() {
 			return this.cartList.reduce((sum, item) => sum + item.count, 0)
 		}
 	},
 	onLoad(option) {
 		console.log('页面参数:', option)
 		this.goodsId = option.id
 		this.storeId = option.storeId
 		this.loadCartList()
 		this.loadGoodsDetail()
 	},
 	onShow() {
 		// 每次显示页面刷新购物车数据
 		this.loadCartList()
 	},
 	methods: {
 		// 加载购物车数据
 		loadCartList() {
 			try {
 				const cartList = uni.getStorageSync('cartList')
 				this.cartList = cartList || []
 			} catch (e) {
 				console.error('加载购物车失败:', e)
 				this.cartList = []
 			}
 		},
 		// 加载商品详情
 		async loadGoodsDetail() {
 			// 这里应该是真实的API调用
 			// const { result } = await this.$request.post(this.$apis.goods.detail, { 
 			// 	goodsId: this.goodsId,
 			// 	storeId: this.storeId 
 			// })
 			// this.goodsDetail = result
 			
 			// 模拟数据
 			setTimeout(() => {
 				this.goodsDetail = {
 					productId: this.goodsId,
 					name: '黄焖鸡米饭',
 					desc: '秘制酱料，鲜嫩多汁，配米饭一绝',
 					price: 25,
 					original: 35,
 					sales: 999,
 					stock: 100,
 					img: 'https://picsum.photos/400/400?random=1',
 					images: [
 						'https://picsum.photos/400/400?random=1',
 						'https://picsum.photos/400/400?random=2',
 						'https://picsum.photos/400/400?random=3'
 					],
 					detail: '<p><img src="https://picsum.photos/750/400?random=4" style="width:100%;"/></p><p style="padding:20rpx;">精选优质鸡肉，搭配秘制酱料，经过慢火炖煮，肉质鲜嫩多汁，入口即化。配以香喷喷的米饭，让您回味无穷。</p>',
 					defaultSpec: {
 						price: 25,
 						attrs: [
 							{ attrId: 1, attrName: '规格', optionId: 11, optionName: '小份' },
 							{ attrId: 1, attrName: '规格', optionId: 12, optionName: '中份' },
 							{ attrId: 1, attrName: '规格', optionId: 13, optionName: '大份' },
 							{ attrId: 2, attrName: '辣度', optionId: 21, optionName: '不辣' },
 							{ attrId: 2, attrName: '辣度', optionId: 22, optionName: '微辣' },
 							{ attrId: 2, attrName: '辣度', optionId: 23, optionName: '中辣' },
 							{ attrId: 2, attrName: '辣度', optionId: 24, optionName: '特辣' }
 						]
 					}
 				}
 				this.currentPrice = this.goodsDetail.defaultSpec?.price || this.goodsDetail.price || 0
 				this.buildAttrGroups()
 			}, 300)
 		},
 		// 构建规格组
 		buildAttrGroups() {
 			const attrs = this.goodsDetail.defaultSpec?.attrs || []
 			if (!attrs.length) {
 				this.attrGroupList = []
 				return
 			}
 			
 			const map = {}
 			attrs.forEach(a => {
 				if (!map[a.attrId]) {
 					map[a.attrId] = {
 						attrId: a.attrId,
 						attrName: a.attrName,
 						options: []
 					}
 				}
 				// 避免重复添加
 				const exist = map[a.attrId].options.find(o => o.optionId === a.optionId)
 				if (!exist) {
 					map[a.attrId].options.push({
 						optionId: a.optionId,
 						optionName: a.optionName
 					})
 				}
 			})
 			this.attrGroupList = Object.values(map)
 			
 			// 默认选中第一个
 			this.selectedOptions = {}
 			this.attrGroupList.forEach(g => {
 				if (g.options.length) {
 					this.$set(this.selectedOptions, g.attrId, g.options[0].optionId)
 				}
 			})
 		},
 		// 打开规格弹窗
 		openSpecPopup() {
 			if (!this.hasSpecs) return
 			// 如果没有构建过规格组，先构建
 			if (!this.attrGroupList.length) {
 				this.buildAttrGroups()
 			}
 			this.showSpecPopup = true
 		},
 		// 关闭规格弹窗
 		closeSpecPopup() {
 			this.showSpecPopup = false
 		},
 		// 选择规格
 		selectOption(attrId, optionId) {
 			this.$set(this.selectedOptions, attrId, optionId)
 			// 这里可以根据规格组合计算不同价格
 			this.calcPrice()
 		},
 		// 计算价格
 		calcPrice() {
 			// 简化处理，实际应该根据规格组合查询价格
 			let price = this.goodsDetail.defaultSpec?.price || this.goodsDetail.price || 0
 			// 示例：大份加5元
 			const sizeOpt = this.selectedOptions[1] // 规格
 			if (sizeOpt === 13) { // 大份
 				price += 5
 			} else if (sizeOpt === 12) { // 中份
 				price += 3
 			}
 			this.currentPrice = price
 		},
 		// 确定规格
 		confirmSpec() {
 			this.closeSpecPopup()
 			// 如果是为了加入购物车而打开，则继续加入
 			if (this._addingToCart) {
 				this._addingToCart = false
 				this.doAddToCart()
 			}
 		},
 		// 加入购物车
 		addToCart() {
 			if (this.hasSpecs) {
 				// 有规格，先打开规格选择
 				this._addingToCart = true
 				this.openSpecPopup()
 				return
 			}
 			this.doAddToCart()
 		},
 		// 执行加入购物车
 		doAddToCart() {
 			const item = {
 				productId: this.goodsDetail.productId,
 				name: this.goodsDetail.name,
 				img: this.goodsDetail.img,
 				price: this.currentPrice,
 				specId: this.goodsDetail.defaultSpec?.specId || 0,
 				specText: this.selectedSpecText,
 				count: 1,
 				storeId: this.storeId
 			}
 			
 			// 查找是否已存在相同商品相同规格
 			const existIndex = this.cartList.findIndex(i => 
 				i.productId === item.productId && i.specText === item.specText
 			)
 			
 			if (existIndex >= 0) {
 				this.cartList[existIndex].count++
 			} else {
 				this.cartList.push(item)
 			}
 			
 			// 保存到本地
 			uni.setStorageSync('cartList', this.cartList)
 			
 			uni.showToast({ 
 				title: '已加入购物车', 
 				icon: 'success',
 				duration: 1500
 			})
 		},
 		// 立即购买
 		buyNow() {
 			this.addToCart()
 			// 跳转到订单确认页
 			uni.navigateTo({
 				url: `/pages/order/confirm?storeId=${this.storeId}&buyNow=1`
 			})
 		},
 		// 返回店铺
 		backToShop() {
 			uni.navigateBack()
 		},
 		// 去购物车
 		goToCart() {
 			// 如果当前就在店铺页，直接返回
 			const pages = getCurrentPages()
 			if (pages.length > 1) {
 				const prevPage = pages[pages.length - 2]
 				if (prevPage.route && prevPage.route.includes('store')) {
 					uni.navigateBack()
 					return
 				}
 			}
 			// 否则跳转到店铺页
 			uni.navigateTo({
 				url: `/pages/store/index?id=${this.storeId}`
 			})
 		}
 	}
 }
 </script>
 
 <style lang="scss" scoped>
 .goods-detail-page {
 	min-height: 100vh;
 	background: #f5f5f5;
 	padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
 }
 
 .goods-image-wrap {
 	height: 750rpx;
 	background: #fff;
 	
 	.goods-swiper {
 		height: 100%;
 		
 		.goods-image {
 			width: 100%;
 			height: 100%;
 		}
 	}
 }
 
 .goods-info-card {
 	background: #fff;
 	padding: 30rpx;
 	margin-bottom: 20rpx;
 	
 	.price-row {
 		display: flex;
 		align-items: baseline;
 		gap: 16rpx;
 		margin-bottom: 20rpx;
 		
 		.price-symbol {
 			font-size: 28rpx;
 			color: #ff4d4f;
 		}
 		
 		.price-value {
 			font-size: 48rpx;
 			font-weight: bold;
 			color: #ff4d4f;
 		}
 		
 		.price-original {
 			font-size: 28rpx;
 			color: #999;
 			text-decoration: line-through;
 		}
 	}
 	
 	.goods-name {
 		font-size: 36rpx;
 		font-weight: bold;
 		color: #333;
 		margin-bottom: 16rpx;
 		line-height: 1.4;
 	}
 	
 	.goods-desc {
 		font-size: 28rpx;
 		color: #666;
 		margin-bottom: 16rpx;
 		line-height: 1.6;
 	}
 	
 	.goods-sales {
 		font-size: 24rpx;
 		color: #999;
 	}
 }
 
 .spec-card {
 	display: flex;
 	align-items: center;
 	background: #fff;
 	padding: 30rpx;
 	margin-bottom: 20rpx;
 	
 	.spec-label {
 		font-size: 28rpx;
 		color: #999;
 		margin-right: 20rpx;
 		flex-shrink: 0;
 	}
 	
 	.spec-value {
 		flex: 1;
 		font-size: 28rpx;
 		color: #333;
 	}
 	
 	.arrow-icon {
 		font-size: 36rpx;
 		color: #999;
 		margin-left: 10rpx;
 	}
 }
 
 .detail-card {
 	background: #fff;
 	padding: 30rpx;
 	min-height: 400rpx;
 	
 	.detail-title {
 		font-size: 32rpx;
 		font-weight: bold;
 		color: #333;
 		margin-bottom: 20rpx;
 		padding-bottom: 20rpx;
 		border-bottom: 1rpx solid #eee;
 	}
 	
 	.detail-content {
 		font-size: 28rpx;
 		color: #666;
 		line-height: 1.8;
 		
 		::v-deep img {
 			max-width: 100%;
 			display: block;
 			margin: 20rpx 0;
 		}
 		
 		.empty-detail {
 			text-align: center;
 			color: #999;
 			padding: 60rpx 0;
 		}
 	}
 }
 
 .bottom-placeholder {
 	height: 120rpx;
 }
 
 .bottom-bar {
 	position: fixed;
 	left: 0;
 	right: 0;
 	bottom: 0;
 	height: 100rpx;
 	background: #fff;
 	border-top: 1rpx solid #eee;
 	display: flex;
 	align-items: center;
 	padding: 0 24rpx;
 	padding-bottom: env(safe-area-inset-bottom);
 	z-index: 100;
 	
 	.shop-info, .cart-info {
 		display: flex;
 		flex-direction: column;
 		align-items: center;
 		padding: 0 20rpx;
 		position: relative;
 		
 		.icon-wrap {
 			position: relative;
 			width: 48rpx;
 			height: 48rpx;
 			display: flex;
 			align-items: center;
 			justify-content: center;
 			
 			.iconfont {
 				font-size: 40rpx;
 			}
 			
 			.cart-badge {
 				position: absolute;
 				top: -8rpx;
 				right: -12rpx;
 				min-width: 32rpx;
 				height: 32rpx;
 				background: #ff4d4f;
 				color: #fff;
 				font-size: 20rpx;
 				border-radius: 16rpx;
 				display: flex;
 				align-items: center;
 				justify-content: center;
 				padding: 0 8rpx;
 			}
 		}
 		
 		.icon-text {
 			font-size: 20rpx;
 			color: #666;
 			margin-top: 4rpx;
 		}
 	}
 	
 	.action-btns {
 		flex: 1;
 		display: flex;
 		gap: 20rpx;
 		margin-left: 20rpx;
 		
 		.btn-add-cart, .btn-buy {
 			flex: 1;
 			height: 72rpx;
 			border-radius: 36rpx;
 			display: flex;
 			align-items: center;
 			justify-content: center;
 			font-size: 28rpx;
 			font-weight: bold;
 		}
 		
 		.btn-add-cart {
 			background: #ffe4e0;
 			color: #ff4d4f;
 		}
 		
 		.btn-buy {
 			background: linear-gradient(135deg, #ff6b35 0%, #ff4d4f 100%);
 			color: #fff;
 		}
 	}
 }
 
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
 		background: rgba(0,0,0,0.6);
 	}
 	
 	.spec-content {
 		position: relative;
 		background: #fff;
 		border-radius: 24rpx 24rpx 0 0;
 		max-height: 70vh;
 		display: flex;
 		flex-direction: column;
 		animation: slideUp 0.3s ease-out;
 		
 		.spec-header {
 			display: flex;
 			padding: 30rpx;
 			position: relative;
 			flex-shrink: 0;
 			
 			.good-img {
 				width: 180rpx;
 				height: 180rpx;
 				border-radius: 12rpx;
 				margin-right: 20rpx;
 				flex-shrink: 0;
 			}
 			
 			.good-info {
 				flex: 1;
 				display: flex;
 				flex-direction: column;
 				justify-content: center;
 				min-width: 0;
 				
 				.good-price {
 					font-size: 40rpx;
 					color: #ff4d4f;
 					font-weight: bold;
 					margin-bottom: 12rpx;
 				}
 				
 				.good-stock {
 					font-size: 24rpx;
 					color: #999;
 					margin-bottom: 12rpx;
 				}
 				
 				.selected-text {
 					font-size: 26rpx;
 					color: #333;
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
 			}
 		}
 		
 		.spec-body {
 			flex: 1;
 			overflow: hidden;
 			padding: 0 30rpx;
 			max-height: 40vh;
 			
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
 			
 			.confirm-btn {
 				width: 100%;
 				height: 88rpx;
 				background: #ff4d4f;
 				color: #fff;
 				font-size: 30rpx;
 				font-weight: bold;
 				border-radius: 44rpx;
 				border: none;
 				display: flex;
 				align-items: center;
 				justify-content: center;
 				
 				&::after {
 					border: none;
 				}
 			}
 		}
 	}
 }
 
 @keyframes slideUp {
 	from { transform: translateY(100%); }
 	to { transform: translateY(0); }
 }
 </style>
