 <template>
	<view class="home-page">
		<!-- 吸顶搜索框 -->
		<view class="search-bar-sticky">
			<view class="search-box" @click="toSearchPage">
				<uni-icons type="search" size="18" color="#999" />
				<text class="placeholder">搜索闪购商品</text>
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
				flashSaleList: [{
						id: 1,
						name: "iPhone 15 Pro Max 256GB",
						price: 8999,
						originalPrice: 9999,
						image: "https://picsum.photos/300/300?random=10",
						progress: 75
					},
					{
						id: 2,
						name: "AirPods Pro 2",
						price: 1299,
						originalPrice: 1499,
						image: "https://picsum.photos/300/300?random=11",
						progress: 60
					},
					{
						id: 3,
						name: "MacBook Air M2",
						price: 7999,
						originalPrice: 8999,
						image: "https://picsum.photos/300/300?random=12",
						progress: 45
					}
				],
				hours: "00",
				minutes: "30",
				seconds: "00",
				storeList: [],
				isLoaded: false,
				locationFound: false
			};
		},

 		onLoad() {
			setTimeout(() => {
				this.getRealLocation();
			}, 500);
		},

		onUnload() {
			// 页面卸载时的清理工作
		},

 		methods: {
 			// 真实定位（修复版，必回调）
				getRealLocation() {
					this.currentLocation = "正在获取位置…";
					this.locationFound = false; // 重置定位标志

					// 设置超时兜底
					const timeout = setTimeout(() => {
						if (!this.locationFound) {
							console.log('定位超时，使用默认位置');
							this.useDefaultLocation();
						}
					}, 12000); // 延长到12秒给IP定位足够时间

					// #ifdef H5
					this.getH5Location(timeout);
					// #endif

					// #ifndef H5
					this.getUniLocation(timeout);
					// #endif
				},

			// H5端使用浏览器原生定位（关闭高精度模式更快）
			getH5Location(timeout) {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(
						(position) => {
							clearTimeout(timeout);
							const lat = position.coords.latitude;
							const lng = position.coords.longitude;
							console.log('浏览器定位成功', lat, lng);
							this.regeoAddress(lat, lng);
						},
						(err) => {
							console.error('浏览器定位失败', err);
							this.getFreeIpLocation();
						},
						{ enableHighAccuracy: false, timeout: 3000, maximumAge: 600000 }
					);
				} else {
					this.getFreeIpLocation();
				}
			},

			// 高德定位（降级方案）
			getAmapLocation(timeout) {
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
					console.log('开始高德定位');
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
								console.log('高德定位成功', result);
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
				console.log('开始高德IP定位');
				uni.request({
					url: "https://restapi.amap.com/v3/ip",
					data: {
						key: AMAP_KEY,
						output: "json"
					},
					timeout: 3000,
					success: (res) => {
						console.log('高德IP定位请求成功', res.data);
						if (res.data.status === "1" && res.data.rectangle) {
							const rectangle = res.data.rectangle.split(';');
							const [lng1, lat1] = rectangle[0].split(',');
							const [lng2, lat2] = rectangle[1].split(',');
							const centerLat = (parseFloat(lat1) + parseFloat(lat2)) / 2;
							const centerLng = (parseFloat(lng1) + parseFloat(lng2)) / 2;
							const city = res.data.city || "当前城市";
							// 先显示城市名，同时通过逆地理编码获取具体地址
							this.currentLocation = city;
							this.regeoAddress(centerLat, centerLng, city);
						} else {
							console.error('高德IP定位数据无效', res.data);
							this.getFreeIpLocation();
						}
					},
					fail: (err) => {
						console.error('高德IP定位请求失败', err);
						this.getFreeIpLocation();
					}
				});
			},

			// 免费IP定位（JSONP方式）
			getFreeIpLocation() {
				console.log('开始腾讯IP定位(JSONP)');
				const callbackName = 'qqLocCallback_' + Date.now();
				const script = document.createElement('script');
				
				window[callbackName] = (res) => {
					console.log('腾讯IP定位结果', res);
					delete window[callbackName];
					if (res?.status === 0 && res?.result?.location) {
						const loc = res.result.location;
						const city = res.result.ad_info?.city || res.result.ad_info?.province || "当前城市";
						// 先显示城市名，同时通过逆地理编码获取具体地址
						this.currentLocation = city;
						this.regeoAddress(loc.lat, loc.lng, city);
					} else {
						// 备用ip-api
						this.getIpApiLocation();
					}
				};
				
				script.src = `https://apis.map.qq.com/ws/location/v1/ip?key=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77&output=jsonp&callback=${callbackName}`;
				script.onerror = () => {
					delete window[callbackName];
					this.getIpApiLocation();
				};
				
				setTimeout(() => {
					if (window[callbackName]) {
						delete window[callbackName];
						this.getIpApiLocation();
					}
				}, 3000);
				
				document.head.appendChild(script);
			},

		// 备用IP定位（使用IPInfo服务）
			getIpApiLocation() {
				console.log('开始IPInfo定位');
				// 使用 ipinfo.io JSONP（支持https，无需Key）
				const callbackName = 'ipinfoCallback_' + Date.now();
				const script = document.createElement('script');
				
				window[callbackName] = (data) => {
					console.log('IPInfo定位结果', data);
					delete window[callbackName];
					// ipinfo返回的是 "lat,lng" 字符串
					if (data?.loc) {
						const [lat, lng] = data.loc.split(',');
						const latNum = parseFloat(lat);
						const lngNum = parseFloat(lng);
						// 城市名映射
						const cityMap = {
							'Beijing': '北京',
							'Shanghai': '上海',
							'Guangzhou': '广州',
							'Shenzhen': '深圳',
							'Chengdu': '成都',
							'Hangzhou': '杭州',
							'Wuhan': '武汉',
							'Xi\'an': '西安',
							'Nanjing': '南京',
							'Chongqing': '重庆'
						};
						let city = data.city || "当前城市";
						city = cityMap[city] || city;
						// 先显示城市名，同时通过逆地理编码获取具体地址
						this.currentLocation = city;
						this.regeoAddress(latNum, lngNum, city);
					} else {
						this.useDefaultLocation();
					}
				};
				
				script.src = `https://ipinfo.io/json?callback=${callbackName}`;
				script.onerror = () => {
					delete window[callbackName];
					this.useDefaultLocation();
				};
				
				setTimeout(() => {
					if (window[callbackName]) {
						delete window[callbackName];
						this.useDefaultLocation();
					}
				}, 3000);
				
				document.head.appendChild(script);
			},

		// 使用默认坐标
			useDefaultLocation() {
				this.locationFound = true; // 标记已完成定位流程
				this.currentLocation = "点击选择位置";
				this.latitude = DEFAULT_LAT;
				this.longitude = DEFAULT_LNG;
				// 提示用户可以手动选择位置
				uni.showToast({
					title: '定位失败，请点击选择位置',
					icon: 'none',
					duration: 2000
				});
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
							uni.showToast({
								title: "定位失败，尝试IP定位",
								icon: "none",
								duration: 1500
							});
							this.getIpLocation();
						}
					});
				},

			// 高德逆地理编码
			regeoAddress(lat, lng, fallbackName = null) {
				uni.request({
					url: "https://restapi.amap.com/v3/geocode/regeo",
					data: {
						key: AMAP_KEY,
						location: `${lng},${lat}`,
						output: "json"
					},
					success: (res) => {
						let addr = fallbackName || "当前位置";
						if (res.data.status === "1" && res.data.regeocode?.formatted_address) {
							addr = res.data.regeocode.formatted_address;
						}
						this.setLocation(lat, lng, addr);
					},
					fail: () => {
						// 逆地理编码失败，使用传入的fallbackName或默认值
						this.setLocation(lat, lng, fallbackName || "当前位置");
					}
				});
			},

		// 点击 → 打开地图选点
			chooseLocation() {
				// 使用uni原生选点（无需Key，支持搜索）
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

			// H5端：腾讯地图选点组件（支持关键词搜索）
			openTencentMapPicker() {
				const key = 'YDKBZ-SDO6W-JIZRD-3NX5T-3UHKJ-INFBD'; // 替换为你的腾讯Key
				const referer = '外卖APP'; // 你的应用名称
				
				// 打开腾讯地图选点组件
				const url = `https://apis.map.qq.com/tools/locpicker?search=1&type=0&key=${key}&referer=${referer}`;
				
				// 创建iframe弹窗
				const pickerDiv = document.createElement('div');
				pickerDiv.id = 'tencentMapPicker';
				pickerDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;background:#fff;';
				pickerDiv.innerHTML = `
					<iframe id="mapPickerFrame" src="${url}" width="100%" height="100%" frameborder="0"></iframe>
					<div style="position:absolute;top:10px;right:10px;z-index:10000;display:flex;gap:10px;">
						<button id="confirmPicker" style="padding:8px 16px;background:#07c160;color:#fff;border:none;border-radius:4px;font-size:14px;">确定</button>
						<button id="closePicker" style="padding:8px 16px;background:#ff6000;color:#fff;border:none;border-radius:4px;font-size:14px;">关闭</button>
					</div>
					<div id="pickerStatus" style="position:absolute;bottom:60px;left:50%;transform:translateX(-50%);z-index:10000;background:rgba(0,0,0,0.7);color:#fff;padding:8px 16px;border-radius:20px;font-size:12px;display:none;">请在地图上选择位置</div>
				`;
				document.body.appendChild(pickerDiv);
				
				let selectedLocation = null;
				const statusDiv = document.getElementById('pickerStatus');
				
				// 关闭按钮
				document.getElementById('closePicker').onclick = () => {
					document.body.removeChild(pickerDiv);
					window.removeEventListener('message', messageHandler);
				};
				
				// 确定按钮
				document.getElementById('confirmPicker').onclick = () => {
					if (selectedLocation) {
						this.setLocation(selectedLocation.lat, selectedLocation.lng, selectedLocation.name);
						document.body.removeChild(pickerDiv);
						window.removeEventListener('message', messageHandler);
					} else {
						statusDiv.textContent = '请先在地图上点击选择位置';
						statusDiv.style.display = 'block';
						setTimeout(() => statusDiv.style.display = 'none', 2000);
					}
				};
				
				// 监听选点结果
				const messageHandler = (event) => {
					const loc = event.data;
					if (loc && loc.module === 'locationPicker') {
						console.log('腾讯地图选点结果:', loc);
						selectedLocation = {
							lat: loc.latlng?.lat,
							lng: loc.latlng?.lng,
							name: loc.poiname || loc.poiaddress || '选中位置'
						};
						statusDiv.textContent = '已选择: ' + selectedLocation.name;
						statusDiv.style.display = 'block';
					}
				};
				window.addEventListener('message', messageHandler);
			},

		// 保存位置并刷新商家
			setLocation(lat, lng, name) {
				this.locationFound = true; // 标记定位成功
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
					// 处理距离单位：公里 -> km
					arr.forEach(store => {
						if (store.distanceText) {
							store.distanceText = store.distanceText.replace('公里', 'km');
						}
					});
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
			toGoodsDetail(item) {
				uni.navigateTo({
					url: `/pages/goods/detail?id=${item.id}`
				});
			},
			// 跳转到门店详情
			toStoreDetail(store) {
				// 已打烊门店给出提示
				if (store.business_status === '已打烊' || store.business_status === '休息中') {
					uni.showModal({
						title: '门店' + store.business_status,
						content: '该门店当前' + store.business_status + '，您可查看商品但暂时无法下单',
						confirmText: '仍要查看',
						cancelText: '返回',
						success: (res) => {
							if (res.confirm) {
								this.$Router.push({
									path: '/pages/home/storeDetail',
									query: { id: store.id }
								});
							}
						}
					});
				} else {
					this.$Router.push({
						path: '/pages/home/storeDetail',
						query: { id: store.id }
					});
				}
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

	.flash-sale-section {
		margin-top: 20rpx;
		background: #fff;

		.section-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx;
			border-bottom: 1rpx solid #eee;

			.section-title {
				font-size: 32rpx;
				font-weight: bold;
			}

			.countdown-container {
				display: flex;
				align-items: center;

				.countdown-label {
					font-size: 24rpx;
					color: #666;
					margin-right: 10rpx;
				}

				.countdown {
					display: flex;
					align-items: center;

					.countdown-item {
						width: 40rpx;
						height: 40rpx;
						background: #333;
						color: #fff;
						font-size: 24rpx;
						text-align: center;
						line-height: 40rpx;
						border-radius: 4rpx;
					}

					.text {
						margin: 0 10rpx;
						font-size: 24rpx;
						color: #333;
					}
				}
			}
		}

		.flash-sale-scroll {
			padding: 30rpx 0;

			.flash-sale-item {
				flex-shrink: 0;
				width: 280rpx;
				margin-left: 30rpx;

				.flash-sale-image {
					width: 280rpx;
					height: 280rpx;
					border-radius: 8rpx;
				}

				.flash-sale-info {
					margin-top: 15rpx;

					.flash-sale-name {
						display: -webkit-box;
						-webkit-line-clamp: 2;
						-webkit-box-orient: vertical;
						overflow: hidden;
						font-size: 24rpx;
						color: #333;
						line-height: 1.4;
					}

					.flash-sale-price {
						margin-top: 10rpx;
						display: flex;
						align-items: baseline;

						.price {
							font-size: 28rpx;
							font-weight: bold;
							color: #ff6000;
							margin-right: 10rpx;
						}

						.original-price {
							font-size: 20rpx;
							color: #999;
							text-decoration: line-through;
						}
					}

					.flash-sale-progress {
						margin-top: 10rpx;

						.progress-bar {
							width: 100%;
							height: 4rpx;
							background: #f2f2f2;
							border-radius: 2rpx;

							.progress-fill {
								height: 100%;
								background: #ff6000;
								border-radius: 2rpx;
							}
						}

						.progress-text {
							margin-top: 8rpx;
							font-size: 20rpx;
							color: #999;
						}
					}
				}
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