 <template>
 	<view class="home-page">
 		<home-skeleton v-if="pageLoading" />
 		
 		<template v-else>
 			<view class="search-bar-sticky">
 				<view class="search-box" @click="toSearchPage">
 					<uni-icons type="search" size="18" color="#999" />
 					<text class="placeholder">搜索闪购商品</text>
 				</view>
 			</view>
 
 			<view class="location-bar" @click="chooseLocation">
 				<uni-icons type="location-filled" size="16" color="#ff6000" />
 				<text class="location-text" :class="{'location-loading': isLocating}">
 					{{ currentLocation || '定位中…' }}
 				</text>
 				<view class="refresh-btn" v-if="isLocating">
 					<view class="refresh-spinner"></view>
 				</view>
 				<uni-icons v-else type="right" size="14" color="#999" />
 			</view>
 
 			<swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000">
 				<swiper-item v-for="(item, index) in bannerList" :key="index">
 					<image class="banner-img" :src="item.image" mode="aspectFill" />
 				</swiper-item>
 			</swiper>
 
 			<scroll-view class="category-scroll" scroll-x="true" scroll-with-animation>
 				<view class="category-nav">
 					<view class="category-item" v-for="(item, index) in categoryList" :key="index" @click="categoryClick(item)">
 						<image class="category-icon" :src="item.icon" mode="aspectFill" />
 						<text class="category-name">{{ item.name }}</text>
 					</view>
 				</view>
 			</scroll-view>
 			
 			<view class="store-section">
 				<view class="section-title">附近商家</view>
 				<view class="store-list-wrapper">
 					<mescroll-uni ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="upCallback" :top="'auto'"
 						:height="'auto'" :fixed="false">
 						<view class="store-list" v-if="storeList.length > 0">
 							<view class="store-item" v-for="(store, index) in storeList" :key="store.id" @click="toStoreDetail(store)">
 								<image class="store-image"
 							:src="(store.avatarImg ? $utils.processImageUrl(store.avatarImg) : $utils.processImageUrl('http://image.jxxqz.com:3001/fc57d5031095495fae039977ec738d01.jpeg'))"
 							mode="aspectFill" />
 								<view class="store-info">
 									<view class="store-header">
 										<text class="store-name">{{ store.storeName }}</text>
 										<text class="store-distance">{{ store.distanceText || '未知距离' }}</text>
 									</view>
 									<view class="store-status">
 										<view class="store-status-rest" v-if="store.business_status==='休息中'">
 											<text class="text">休息中</text>
 											<text class="time">{{store.next_open_time}}</text>
 										</view>
 										<view class="store-status-open" v-else-if="store.business_status==='营业中'">
 											<text class="text">营业中</text>
 											<text class="time">{{store.today_hours}}</text>
 										</view>
 										<view class="store-status-rest" v-else-if="store.business_status==='已打烊'">
 											<text class="text">已打烊</text>
 											<text class="time">{{store.next_open_time}}</text>
 										</view>
 										<view class="store-status-none" v-else>
 											<text class="text">{{store.business_status}}</text>
 										</view>
 									</view>
 									<view class="store-meta">
 										<text class="rating">⭐ {{ store.rating || 5.0 }}</text>
 										<text class="sales">月售{{ store.monthly_sales || 88 }}</text>
 									</view>
 									<view class="store-delivery">
 										<text class="delivery-fee">配送 ¥{{ store.delivery_fee || 0 }}</text>
 										<text class="min-order">起送 ¥{{ store.min_order_amount || 20 }}</text>
 									</view>
 								</view>
 							</view>
 						</view>
 						<view class="empty-box" v-if="storeList.length === 0 && isLoaded">
 							<image class="empty-icon" src="/static/images/empty.png" />
 							<text class="empty-text">暂无优质商家</text>
 						</view>
 					</mescroll-uni>
 				</view>
 			</view>
 		</template>
 	</view>
 </template>
 
 <script>
 import MescrollMixin from "@/components/mescroll-uni/mescroll-mixins.js";
 import HomeSkeleton from "@/components/skeleton-screen/home-skeleton.vue";
 
 // 默认兜底坐标
 const DEFAULT_LAT = 39.9042;
 const DEFAULT_LNG = 116.4074;
 
 export default {
 	mixins: [MescrollMixin],
 	components: { HomeSkeleton },
 	data() {
 		return {
 			pageLoading: true,
 			currentLocation: "点击定位/手动选位置",
 			latitude: null,
 			longitude: null,
 			bannerList: [
 				{ image: "https://picsum.photos/750/300?random=1" },
 				{ image: "https://picsum.photos/750/300?random=2" }
 			],
 			categoryList: [
 				{ id: 1, name: "美食", icon: "https://picsum.photos/120/120?random=1" },
 				{ id: 2, name: "超市", icon: "https://picsum.photos/120/120?random=2" },
 				{ id: 3, name: "鲜花", icon: "https://picsum.photos/120/120?random=3" },
 				{ id: 4, name: "药品", icon: "https://picsum.photos/120/120?random=4" },
 				{ id: 5, name: "跑腿", icon: "https://picsum.photos/120/120?random=5" },
 				{ id: 6, name: "水果", icon: "https://picsum.photos/120/120?random=6" },
 				{ id: 7, name: "奶茶", icon: "https://picsum.photos/120/120?random=7" },
 				{ id: 8, name: "更多", icon: "https://picsum.photos/120/120?random=8" }
 			],
 			storeList: [],
 			isLoaded: false,
 			isLocating: false
 		};
 	},
 	onLoad() {
 		// 关闭骨架屏兜底
 		setTimeout(() => {
 			if (this.pageLoading) this.pageLoading = false;
 		}, 5000);
 		// 页面加载时，先从缓存读取上次的位置
 		const cached = uni.getStorageSync('locationInfo');
 		if (cached) {
 			this.setLocation(cached.lat, cached.lng, cached.name);
 		}
 	},
 	onShow() {
 		if (this.storeList.length > 0) this.pageLoading = false;
 	},
 	methods: {
 		// 一键获取GPS定位
 		getGpsLocation() {
 			this.currentLocation = "正在获取位置…";
 			this.isLocating = true;
 			
 			if (!navigator.geolocation) {
 				uni.showToast({ title: "浏览器不支持GPS定位", icon: "none" });
 				this.isLocating = false;
 				return;
 			}
 			
 			navigator.geolocation.getCurrentPosition(
 				(pos) => {
 					this.isLocating = false;
 					const lat = pos.coords.latitude;
 					const lng = pos.coords.longitude;
 					// 直接用坐标，不再依赖地图逆解析
 					this.setLocation(lat, lng, `GPS定位(${lat.toFixed(2)},${lng.toFixed(2)})`);
 				},
 				(err) => {
 					this.isLocating = false;
 					console.error("GPS定位失败", err);
 					uni.showModal({
 						title: "定位失败",
 						content: "无法获取GPS位置，请检查浏览器权限或手动选择位置",
 						confirmText: "手动选位置",
 						cancelText: "取消",
 						success: (res) => {
 							if (res.confirm) this.manualChooseLocation();
 						}
 					});
 				},
 				{ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
 			);
 		},
 		
 		// 点击定位栏，弹出菜单
 		chooseLocation() {
 			uni.showActionSheet({
 				itemList: ['🔄 获取当前GPS位置', '🗺️ 手动选择位置'],
 				success: (res) => {
 					if (res.tapIndex === 0) {
 						this.getGpsLocation();
 					} else if (res.tapIndex === 1) {
 						this.manualChooseLocation();
 					}
 				}
 			});
 		},
 		
 		// 手动选择位置（用uni自带的选点，不依赖第三方地图Key）
 		manualChooseLocation() {
 			uni.chooseLocation({
 				success: (res) => {
 					this.setLocation(res.latitude, res.longitude, res.name || res.address);
 				},
 				fail: () => {
 					uni.showToast({ title: "选点失败，请重试", icon: "none" });
 				}
 			});
 		},
 		
 		// 保存位置，刷新列表
 		setLocation(lat, lng, name) {
 			this.latitude = lat;
 			this.longitude = lng;
 			this.currentLocation = name;
 			uni.setStorageSync("locationInfo", { name, lat, lng });
 			this.mescroll?.resetUpScroll();
 		},
 		
 		downCallback() {
 			this.storeList = [];
 			this.mescroll.resetUpScroll();
 		},
 		
 		upCallback(page) {
 			const lat = this.latitude || DEFAULT_LAT;
 			const lng = this.longitude || DEFAULT_LNG;
 			const params = { page: page.num, size: page.size, lat, lng };
 			
 			this.$request.post(this.$apis.index.storeList, params).then(res => {
 				const arr = res.result.content || [];
 				const total = res.result.totalElements || 0;
 				arr.forEach(store => {
 					if (store.distanceText) store.distanceText = store.distanceText.replace('公里', 'km');
 				});
 				if (page.num === 1) this.storeList = [];
 				this.storeList = this.storeList.concat(arr);
 				this.isLoaded = true;
 				if (page.num === 1) this.pageLoading = false;
 				this.mescroll.endSuccess(arr.length, total);
 			}).catch(() => {
 				this.pageLoading = false;
 				this.mescroll.endErr();
 			});
 		},
 		
 		toSearchPage() { uni.navigateTo({ url: "/pages/home/search" }); },
 		categoryClick(item) { uni.navigateTo({ url: `/pages/home/category?id=${item.id}&name=${item.name}` }); },
 		toStoreDetail(store) {
 			this.$Router.push({ path: '/pages/home/storeDetail', query: { id: store.id } });
 		}
 	}
 };
 </script>
 
 <style lang="scss" scoped>
 	.home-page {
 		min-height: 100vh;
 		background: #f5f5f5;
 	}
 	.search-bar-sticky {
 		position: sticky;
 		top: 0;
 		z-index: 999;
 		padding: 15rpx 30rpx;
 		background: #fff;
 		.search-box {
 			display: flex;
 			align-items: center;
 			height: 64rpx;
 			padding: 0 24rpx;
 			background: #f2f2f2;
 			border-radius: 32rpx;
 			.placeholder {
 				margin-left: 12rpx;
 				font-size: 28rpx;
 				color: #999;
 			}
 		}
 	}
 	.location-bar {
 		display: flex;
 		align-items: center;
 		padding: 16rpx 30rpx;
 		background: #fff;
 		border-bottom: 1rpx solid #f0f0f0;
 		.location-text {
 			flex: 1;
 			margin-left: 10rpx;
 			font-size: 28rpx;
 			color: #333;
 			white-space: nowrap;
 			overflow: hidden;
 			text-overflow: ellipsis;
 			&.location-loading {
 				color: #ff6000;
 			}
 		}
 		.refresh-btn {
 			width: 32rpx;
 			height: 32rpx;
 			margin-left: 10rpx;
 			.refresh-spinner {
 				width: 100%;
 				height: 100%;
 				border: 3rpx solid #f0f0f0;
 				border-top-color: #ff6000;
 				border-radius: 50%;
 				animation: spin 1s linear infinite;
 			}
 		}
 	}
 	@keyframes spin {
 		to { transform: rotate(360deg); }
 	}
 	.banner-swiper {
 		width: 100%;
 		height: 300rpx;
 		.banner-img {
 			width: 100%;
 			height: 100%;
 		}
 	}
 	.category-scroll {
 		background: #fff;
 	}
 	.category-nav {
 		display: flex;
 		padding: 30rpx 0;
 		.category-item {
 			flex-shrink: 0;
 			width: 150rpx;
 			text-align: center;
 			.category-icon {
 				width: 80rpx;
 				height: 80rpx;
 				border-radius: 50%;
 			}
 			.category-name {
 				margin-top: 10rpx;
 				font-size: 24rpx;
 				color: #333;
 			}
 		}
 	}
 	.store-section {
 		margin-top: 20rpx;
 		.section-title {
 			padding: 30rpx;
 			font-size: 32rpx;
 			font-weight: bold;
 			background: #fff;
 			border-bottom: 1rpx solid #eee;
 		}
 	}
 	.store-list {
 		.store-item {
 			display: flex;
 			padding: 30rpx;
 			background: #fff;
 			border-bottom: 1rpx solid #f0f0f0;
 		}
 		.store-image {
 			width: 160rpx;
 			height: 160rpx;
 			border-radius: 8rpx;
 			flex-shrink: 0;
 		}
 		.store-info {
 			flex: 1;
 			margin-left: 20rpx;
 		}
 		.store-header {
 			display: flex;
 			justify-content: space-between;
 			.store-name {
 				font-size: 32rpx;
 				font-weight: bold;
 			}
 			.store-distance {
 				font-size: 24rpx;
 				color: #999;
 			}
 		}
 		.store-status {
 			margin-top: 10rpx;
 			display: flex;
 			gap: 8rpx;
 			flex-wrap: wrap;
 			.text {
 				padding: 6rpx 10rpx;
 				border-radius: 6rpx;
 				font-size: 24rpx;
 				color: #fff;
 			}
 			.time {
 				padding: 6rpx 10rpx;
 				font-size: 24rpx;
 				color: #666;
 			}
 			&-open .text { background: #00c48c; }
 			&-rest .text, &-none .text { background: #999; }
 		}
 		.store-meta {
 			margin-top: 10rpx;
 			.rating { color: #ff6000; font-size: 24rpx; }
 			.sales { margin-left: 20rpx; color: #666; font-size: 24rpx; }
 		}
 		.store-delivery {
 			margin-top: 10rpx;
 			font-size: 24rpx;
 			.delivery-fee { color: #ff6000; margin-right: 20rpx; }
 			.min-order { color: #666; }
 		}
 	}
 	.empty-box {
 		padding: 100rpx 0;
 		text-align: center;
 		.empty-icon {
 			width: 200rpx;
 			height: 200rpx;
 		}
 		.empty-text {
 			margin-top: 20rpx;
 			font-size: 28rpx;
 			color: #999;
 		}
 	}
 </style>