 <template>
 	<view class="home-page">
 		<!-- 吸顶搜索框 -->
 		<view class="search-bar-sticky">
 			<view class="search-box" @click="toSearchPage">
 				<uni-icons type="search" size="18" color="#999" />
 				<text class="placeholder">搜索商家或商品</text>
 			</view>
 		</view>

 		<!-- 定位信息 → 点击直接地图选点 -->
 		<view class="location-bar" @click="chooseLocation">
 			<uni-icons type="location-filled" size="16" color="#ff6000" />
 			<text class="location-text">{{ currentLocation || '定位中…' }}</text>
 			<uni-icons type="right" size="14" color="#999" />
 		</view>

 		<!-- 轮播图 -->
 		<swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000">
 			<swiper-item v-for="(item, index) in bannerList" :key="index">
 				<image class="banner-img" :src="item.image" mode="aspectFill" />
 			</swiper-item>
 		</swiper>

 		<!-- 分类导航 -->
 		<scroll-view class="category-scroll" scroll-x="true" scroll-with-animation>
 			<view class="category-nav">
 				<view class="category-item" v-for="(item, index) in categoryList" :key="index" @click="categoryClick(item)">
 					<image class="category-icon" :src="item.icon" mode="aspectFill" />
 					<text class="category-name">{{ item.name }}</text>
 				</view>
 			</view>
 		</scroll-view>

 		<!-- 推荐商家 -->
 		<view class="store-section">
 			<view class="section-title">附近商家</view>
 			<view class="store-list-wrapper">
 				<mescroll-uni ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="upCallback" :top="'auto'"
 					:height="'auto'" :fixed="false">
 					<view class="store-list" v-if="storeList.length > 0">
 						<view class="store-item" v-for="(store, index) in storeList" :key="store.id" @click="toStoreDetail(store)">
 							<image class="store-image"
 								:src="store.avatarImg || 'http://image.jxxqz.com:3001/fc57d5031095495fae039977ec738d01.jpeg'"
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
 						<text class="empty-text">暂无附近商家</text>
 					</view>
 				</mescroll-uni>
 			</view>
 		</view>
 	</view>
 </template>
 <script>
 	import MescrollMixin from "@/components/mescroll-uni/mescroll-mixins.js";

 	// 高德 Web服务 Key
 	const AMAP_KEY = "a44164dfbe3191271a79f6e55b7d26b6";
 	// 默认坐标（北京天安门）
 	const DEFAULT_LAT = 39.9042;
 	const DEFAULT_LNG = 116.4074;
 	// 先配置安全密钥（必须在加载脚本前）
 	window._AMapSecurityConfig = {
 		securityJsCode: '91a752875c181e6ca8fca50034ba7856'
 	};
 	export default {
 		mixins: [MescrollMixin],
 		data() {
 			return {
 				currentLocation: "定位中…",
 				latitude: null,
 				longitude: null,
 				bannerList: [{
 						image: "https://picsum.photos/750/300?random=1"
 					},
 					{
 						image: "https://picsum.photos/750/300?random=2"
 					}
 				],
 				categoryList: [{
 						id: 1,
 						name: "美食",
 						icon: "https://picsum.photos/120/120?random=1"
 					},
 					{
 						id: 2,
 						name: "超市",
 						icon: "https://picsum.photos/120/120?random=2"
 					},
 					{
 						id: 3,
 						name: "鲜花",
 						icon: "https://picsum.photos/120/120?random=3"
 					},
 					{
 						id: 4,
 						name: "药品",
 						icon: "https://picsum.photos/120/120?random=4"
 					},
 					{
 						id: 5,
 						name: "跑腿",
 						icon: "https://picsum.photos/120/120?random=5"
 					},
 					{
 						id: 6,
 						name: "水果",
 						icon: "https://picsum.photos/120/120?random=6"
 					},
 					{
 						id: 7,
 						name: "奶茶",
 						icon: "https://picsum.photos/120/120?random=7"
 					},
 					{
 						id: 8,
 						name: "更多",
 						icon: "https://picsum.photos/120/120?random=8"
 					}
 				],
 				storeList: [],
 				isLoaded: false
 			};
 		},

 		onLoad() {
 			setTimeout(() => {
 				this.getRealLocation();
 			}, 500);
 		},

 		methods: {
 			// 真实定位（修复版，必回调）
 			getRealLocation() {
 				this.currentLocation = "正在获取位置…";

 				let timeout = setTimeout(() => {
 					console.warn("定位超时，使用IP定位");
 					this.getIpLocation();
 				}, 8000);

 				// #ifdef H5
 				this.getH5Location(timeout);
 				// #endif

 				// #ifndef H5
 				this.getUniLocation(timeout);
 				// #endif
 			},

 			// H5端使用高德JSAPI定位
 			getH5Location(timeout) {

 				if (typeof window.AMap === 'undefined') {
 					const script = document.createElement('script');
 					script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Geolocation`;
 					script.onload = () => {
 						this.initAmapGeolocation(timeout);
 					};
 					script.onerror = () => {
 						clearTimeout(timeout);
 						this.getIpLocation();
 					};
 					document.head.appendChild(script);
 				} else {
 					this.initAmapGeolocation(timeout);
 				}
 			},

 			// 初始化高德定位
 			initAmapGeolocation(timeout) {
 				window.AMap.plugin('AMap.Geolocation', () => {
 					const geolocation = new window.AMap.Geolocation({
 						enableHighAccuracy: true,
 						timeout: 10000,
 						buttonPosition: 'RB',
 						zoomToAccuracy: true
 					});

 					geolocation.getCurrentPosition((status, result) => {
 						clearTimeout(timeout);
 						if (status === 'complete') {
 							const {
 								lat,
 								lng
 							} = result.position;
 							this.regeoAddress(lat, lng);
 						} else {
 							console.error('高德定位失败，尝试IP定位', result);
 							this.getIpLocation();
 						}
 					});
 				});
 			},

 			// IP定位（降级方案）
 			getIpLocation() {
 				uni.request({
 					url: "https://restapi.amap.com/v3/ip",
 					data: {
 						key: AMAP_KEY,
 						output: "json"
 					},
 					success: (res) => {
 						if (res.data.status === "1" && res.data.rectangle) {
 							const rectangle = res.data.rectangle.split(';');
 							const [lng1, lat1] = rectangle[0].split(',');
 							const [lng2, lat2] = rectangle[1].split(',');
 							const centerLat = (parseFloat(lat1) + parseFloat(lat2)) / 2;
 							const centerLng = (parseFloat(lng1) + parseFloat(lng2)) / 2;
 							this.currentLocation = res.data.city || "当前城市";
 							this.setLocation(centerLat, centerLng, this.currentLocation);
 						} else {
 							this.useDefaultLocation();
 						}
 					},
 					fail: () => {
 						this.useDefaultLocation();
 					}
 				});
 			},

 			// 使用默认坐标
 			useDefaultLocation() {
 				this.currentLocation = "定位失败，请点击选择";
 				this.latitude = DEFAULT_LAT;
 				this.longitude = DEFAULT_LNG;
 				this.$nextTick(() => {
 					this.mescroll?.resetUpScroll();
 				});
 			},

 			// 小程序/App端定位
 			getUniLocation(timeout) {
 				uni.getLocation({
 					type: "gcj02",
 					isHighAccuracy: true,
 					success: (res) => {
 						clearTimeout(timeout);
 						this.latitude = res.latitude;
 						this.longitude = res.longitude;
 						this.regeoAddress(res.latitude, res.longitude);
 					},
 					fail: (err) => {
 						clearTimeout(timeout);
 						console.error("定位失败", err);
 						this.getIpLocation();
 					}
 				});
 			},

 			// 高德逆地理编码
 			regeoAddress(lat, lng) {
 				uni.request({
 					url: "https://restapi.amap.com/v3/geocode/regeo",
 					data: {
 						key: AMAP_KEY,
 						location: `${lng},${lat}`,
 						output: "json"
 					},
 					success: (res) => {
 						let addr = "当前位置";
 						if (res.data.status === "1") {
 							addr = res.data.regeocode.formatted_address;
 						}
 						this.setLocation(lat, lng, addr);
 					},
 					fail: () => {
 						this.setLocation(lat, lng, "当前位置");
 					}
 				});
 			},

 			// 点击 → 直接打开地图选点
 			chooseLocation() {
 				uni.chooseLocation({
 					success: (res) => {
 						this.setLocation(res.latitude, res.longitude, res.name || res.address);
 					},
 					fail: (err) => {
 						if (err.errMsg && err.errMsg.includes("cancel")) return;
 						uni.showToast({
 							title: "选择位置失败",
 							icon: "none"
 						});
 					}
 				});
 			},

 			// 保存位置并刷新商家
 			setLocation(lat, lng, name) {
 				this.latitude = lat;
 				this.longitude = lng;
 				this.currentLocation = name;
 				uni.setStorageSync("locationInfo", {
 					name,
 					lat,
 					lng
 				});
 				this.mescroll?.resetUpScroll();
 			},

 			// 下拉刷新
 			downCallback() {
 				this.storeList = [];
 				this.mescroll.resetUpScroll();
 			},

 			// 上拉加载
 			upCallback(page) {
 				const lat = this.latitude || DEFAULT_LAT;
 				const lng = this.longitude || DEFAULT_LNG;

 				const params = {
 					page: page.num,
 					size: page.size,
 					lat: lat,
 					lng: lng
 				};

 				this.$request.post(this.$apis.index.storeList, params).then(res => {
 					const arr = res.result.content || [];
 					const total = res.result.totalElements || 0;
 					if (page.num === 1) this.storeList = [];
 					this.storeList = this.storeList.concat(arr);
 					this.isLoaded = true;
 					this.mescroll.endSuccess(arr.length, total);
 				}).catch(() => {
 					this.mescroll.endErr();
 				});
 			},

 			toSearchPage() {
 				uni.navigateTo({
 					url: "/pages/home/search"
 				});
 			},
 			categoryClick(item) {
 				uni.navigateTo({
 					url: `/pages/home/category?id=${item.id}&name=${item.name}`
 				});
 			},
			// 跳转到门店详情
 			toStoreDetail(store) {
				this.$Router.push({
					path: '/pages/home/storeDetail',
					query: {
					  id: store.id
					}
				})
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
 		}
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

 			&-open .text {
 				background: #00c48c;
 			}
 			&-rest .text,
 			&-none .text {
 				background: #999;
 			}
 		}

 		.store-meta {
 			margin-top: 10rpx;

 			.rating {
 				color: #ff6000;
 				font-size: 24rpx;
 			}

 			.sales {
 				margin-left: 20rpx;
 				color: #666;
 				font-size: 24rpx;
 			}
 		}

 		.store-delivery {
 			margin-top: 10rpx;
 			font-size: 24rpx;

 			.delivery-fee {
 				color: #ff6000;
 				margin-right: 20rpx;
 			}

 			.min-order {
 				color: #666;
 			}
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