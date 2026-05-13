<template>
 	<view class="home-page">
 		<home-skeleton v-if="pageLoading" />
 		
 		<template v-else>
 			<view class="search-bar-sticky">
 				<view class="search-box" @click="toSearchPage">
 					<uni-icons type="search" size="18" color="#999" />
 					<text class="placeholder">搜索商品</text>
 				</view>
 			</view>
 
 			<view class="location-bar" @click="chooseLocation">
				<uni-icons type="location-filled" size="16" color="#333" />
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
 
 // 默认兜底坐标（北京天安门）
const DEFAULT_LAT = 39.9042;
const DEFAULT_LNG = 116.4074;

// 模拟定位数据（用于测试）
const MOCK_LOCATIONS = [
	{ name: '北京市朝阳区望京SOHO T1', lat: 39.9962, lng: 116.4703 },
	{ name: '北京市海淀区中关村软件园二期', lat: 39.9999, lng: 116.2963 },
	{ name: '上海市浦东新区陆家嘴金融中心', lat: 31.2304, lng: 121.4737 },
	{ name: '广州市天河区珠江新城高德置地广场', lat: 23.1291, lng: 113.3245 },
	{ name: '深圳市南山区科技园南区深圳湾生态园', lat: 22.5431, lng: 114.0579 }
];
 
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
		// 自动获取GPS定位
		this.getGpsLocation();
		// 检查是否有默认收货地址，优先使用
		this.checkDefaultAddress();
	},
 	onShow() {
 		if (this.storeList.length > 0) this.pageLoading = false;
 	},
 	methods: {
			// 检查默认收货地址，优先使用
			checkDefaultAddress() {
				try {
					const addressList = uni.getStorageSync('addressList') || [];
					// 查找默认地址
					const defaultAddress = addressList.find(item => item.isDefault);
					if (defaultAddress && defaultAddress.latitude && defaultAddress.longitude) {
						// 如果有默认地址，优先使用默认地址的位置
						this.setLocation(
							parseFloat(defaultAddress.latitude),
							parseFloat(defaultAddress.longitude),
							defaultAddress.detailAddress || defaultAddress.address
						);
					}
				} catch (error) {
					console.error('获取默认地址失败:', error);
				}
			},
			
			// 一键获取GPS定位
		getGpsLocation() {
			this.currentLocation = "正在获取位置…";
			this.isLocating = true;
			
			// 检查是否是安全环境（HTTPS或localhost）
			if (!this.isSecureOrigin()) {
				this.handleNonSecureOrigin();
				return;
			}
			
			// 尝试多种定位方式，按顺序尝试
			this.tryUniLocation();
		},
		
		// 检查是否是安全源
		isSecureOrigin() {
			const hostname = window.location.hostname;
			const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
			const isHttps = window.location.protocol === 'https:';
			const isLocalIp = /^192\.168\./.test(hostname) || /^10\./.test(hostname);
			return isLocalhost || isHttps || isLocalIp;
		},
		
		// 处理非安全环境的定位
		handleNonSecureOrigin() {
			this.isLocating = false;
			
			// 先检查是否有缓存位置
			const cached = uni.getStorageSync('locationInfo');
			if (cached) {
				this.setLocation(cached.lat, cached.lng, cached.name);
				return;
			}
			
			// 检查是否有默认收货地址
			this.checkDefaultAddress();
			
			// 如果都没有，使用IP定位或模拟数据
			this.tryIpLocation();
		},
		
		// 尝试IP定位（调用后端接口）
		tryIpLocation(lat, lng) {
			const data = {};
			if (lat && lng) {
				data.lat = lat;
				data.lng = lng;
			}
			this.$request.post(this.$apis.common.ipLocation, data).then(res => {
				// 后端返回结构: { success, result: { success, province, city, district, adcode, rectangle, latitude, longitude, street, neighborhood, building, address, formatted_address }, code, message }
				if (res.success && res.result && res.result.success) {
					const data = res.result;
					// 使用后端返回的精确坐标（如果有）
					const lat = data.latitude || DEFAULT_LAT;
					const lng = data.longitude || DEFAULT_LNG;
					// 优先使用详细地址，否则使用省市区组合
					let address = '';
					if (data.address) {
						address = data.address;
					} else if (data.district) {
						address = data.district;
					} else if (data.city) {
						address = data.city;
						if (data.district) {
							address += data.district;
						}
					} else if (data.province) {
						address = data.province;
					}
					this.setLocation(lat, lng, address || '定位成功');
				} else {
					console.warn('定位接口返回数据格式不正确:', res);
					this.useMockLocation();
				}
			}).catch(err => {
				console.error('IP定位失败:', err);
				this.useMockLocation();
			});
		},
		
		// 使用模拟定位数据（用于测试）
		useMockLocation() {
			// 随机选择一个模拟位置
			const randomIndex = Math.floor(Math.random() * MOCK_LOCATIONS.length);
			const mock = MOCK_LOCATIONS[randomIndex];
			this.setLocation(mock.lat, mock.lng, mock.name);
		},
		
		// 尝试uni-app官方定位API
		tryUniLocation() {
			uni.getLocation({
				type: 'gcj02',
				timeout: 10000,
				success: (res) => {
					this.isLocating = false;
					const lat = res.latitude;
					const lng = res.longitude;
					this.getAddressByLocation(lat, lng);
				},
				fail: (err) => {
					console.error("uni.getLocation失败:", err);
					// 尝试IP定位
					this.tryIpLocation();
				}
			});
		},
		
		// 通过坐标获取地址名称（逆地理编码）
		getAddressByLocation(lat, lng) {
			// 尝试多个逆地理编码服务
			this.tryReverseGeocode(lat, lng, 0);
		},
		
		// 尝试逆地理编码（支持多个服务）
		tryReverseGeocode(lat, lng, attempt) {
			const services = [
				{
					url: `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
					parser: (data) => this.parseOsmAddress(data)
				},
				{
					url: `https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}`,
					parser: (data) => this.parseOsmAddress(data)
				}
			];
			
			if (attempt >= services.length) {
				// 所有服务都失败了，调用后端接口使用高德地图逆地理编码
				this.tryIpLocation(lat, lng);
				return;
			}
			
			const service = services[attempt];
			
			uni.request({
				url: service.url,
				method: 'GET',
				timeout: 5000,
				success: (res) => {
					if (res.data && res.data.display_name) {
						const address = service.parser(res.data);
						this.setLocation(lat, lng, address);
					} else {
						this.tryReverseGeocode(lat, lng, attempt + 1);
					}
				},
				fail: () => {
					this.tryReverseGeocode(lat, lng, attempt + 1);
				}
			});
		},
		
		// 解析OSM地址信息
		parseOsmAddress(data) {
			const addr = data.address || {};
			let address = '';
			
			// 按详细程度从高到低组合地址
			const parts = [];
			
			// 最详细的地址
			if (addr.building) parts.push(addr.building);           // 大厦/建筑物
			if (addr.neighbourhood) parts.push(addr.neighbourhood); // 小区/社区
			if (addr.suburb) parts.push(addr.suburb);               // 郊区/区域
			if (addr.road) parts.push(addr.road);                   // 街道
			if (addr.house_number) parts.push(addr.house_number);   // 门牌号
			if (addr.city) parts.push(addr.city);                   // 城市
			if (addr.town) parts.push(addr.town);                   // 城镇
			if (addr.village) parts.push(addr.village);             // 村庄
			if (addr.state) parts.push(addr.state);                 // 省份
			
			// 组合地址，最多取前3-4个部分
			address = parts.slice(0, 4).join(' ');
			
			// 如果没有详细地址，使用display_name
			if (!address || address.trim() === '') {
				address = data.display_name || '';
				// 截取前50个字符
				if (address.length > 50) {
					address = address.substring(0, 50) + '...';
				}
			}
			
			return address.trim();
		},
 		
 		// 点击定位栏，弹出菜单
		chooseLocation() {
			const addressList = uni.getStorageSync('addressList') || [];
			const hasAddress = addressList.length > 0;
			
			const menuItems = [
				'🔄 获取当前GPS位置',
				'🗺️ 手动选择位置'
			];
			
			if (hasAddress) {
				menuItems.unshift('📦 使用收货地址');
			}
			
			uni.showActionSheet({
				itemList: menuItems,
				success: (res) => {
					if (hasAddress && res.tapIndex === 0) {
						this.useAddressLocation();
					} else if (hasAddress && res.tapIndex === 1) {
						this.getGpsLocation();
					} else if (hasAddress && res.tapIndex === 2) {
						this.manualChooseLocation();
					} else if (!hasAddress && res.tapIndex === 0) {
						this.getGpsLocation();
					} else if (!hasAddress && res.tapIndex === 1) {
						this.manualChooseLocation();
					}
				}
			});
		},
		
		// 使用收货地址定位
		useAddressLocation() {
			try {
				const addressList = uni.getStorageSync('addressList') || [];
				// 优先使用默认地址
				const defaultAddress = addressList.find(item => item.isDefault);
				const address = defaultAddress || addressList[0];
				
				if (address) {
					if (address.latitude && address.longitude) {
						this.setLocation(
							parseFloat(address.latitude),
							parseFloat(address.longitude),
							address.detailAddress || address.address
						);
						uni.showToast({ title: '已切换到收货地址', icon: 'success' });
					} else {
						// 如果地址没有经纬度，显示地址列表让用户选择
						this.chooseFromAddressList();
					}
				} else {
					uni.showToast({ title: '暂无收货地址', icon: 'none' });
				}
			} catch (error) {
				console.error('使用收货地址失败:', error);
				uni.showToast({ title: '获取地址失败', icon: 'none' });
			}
		},
		
		// 从地址列表选择
		chooseFromAddressList() {
			const addressList = uni.getStorageSync('addressList') || [];
			const itemList = addressList.map(item => `${item.name} ${item.phone} - ${item.detailAddress || item.address}`);
			
			uni.showActionSheet({
				itemList: itemList,
				title: '选择收货地址',
				success: (res) => {
					const address = addressList[res.tapIndex];
					if (address) {
						this.setLocation(
							parseFloat(address.latitude) || DEFAULT_LAT,
							parseFloat(address.longitude) || DEFAULT_LNG,
							address.detailAddress || address.address
						);
					}
				}
			});
		},
		
		// 手动选择位置（兼容H5环境）
		manualChooseLocation() {
			// 检查是否支持chooseLocation（需要配置地图Key）
			this.tryChooseLocation();
		},
		
		// 尝试使用uni.chooseLocation
		tryChooseLocation() {
			uni.chooseLocation({
				success: (res) => {
					this.setLocation(res.latitude, res.longitude, res.name || res.address);
				},
				fail: (err) => {
					console.error("uni.chooseLocation失败:", err);
					// 如果chooseLocation失败（比如没有配置地图Key），显示地址列表选择
					this.showAddressSelector();
				}
			});
		},
		
		// 显示地址选择器（备用方案）
		showAddressSelector() {
			const addressList = uni.getStorageSync('addressList') || [];
			
			if (addressList.length > 0) {
				// 有收货地址，显示地址列表
				this.chooseFromAddressList();
			} else {
				// 没有收货地址，显示输入框让用户输入地址
				this.showAddressInput();
			}
		},
		
		// 显示地址输入框
		showAddressInput() {
			uni.showModal({
				title: '选择位置',
				editable: true,
				placeholderText: '请输入您的位置',
				confirmText: '确定',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm && res.content) {
						// 使用默认坐标，保存地址名称
						this.setLocation(DEFAULT_LAT, DEFAULT_LNG, res.content);
					}
				}
			});
		},
 		
 		// 保存位置，刷新列表
 		setLocation(lat, lng, name) {
 			this.latitude = lat;
 			this.longitude = lng;
 			this.currentLocation = name;
 			this.isLocating = false; // 关闭loading状态
 			uni.setStorageSync("locationInfo", { name, lat, lng });
 			// 刷新门店列表
 			if (this.mescroll) {
 				this.mescroll.resetUpScroll();
 			} else {
 				// 如果mescroll还没初始化，等待初始化后刷新
 				this.$nextTick(() => {
 					if (this.mescroll) {
 						this.mescroll.resetUpScroll();
 					}
 				});
 			}
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
 			font-weight: 500;
 			white-space: nowrap;
 			overflow: hidden;
 			text-overflow: ellipsis;
 			&.location-loading {
 				color: #333;
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