<template>
 	<view class="home-page">
 		<home-skeleton v-if="pageLoading || isLocating" />
 		<template v-else>
 			<view class="search-bar-sticky">
 				<view class="search-box" @click="toSearchPage">
 					<uni-icons type="search" size="18" color="#999" />
 					<text class="placeholder">搜索商品</text>
 				</view>
 			</view>
 			<mescroll-uni ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="upCallback" :top="'auto'"
 				:height="'auto'" :fixed="false" :auto="false">
 				<view class="scroll-content">
 					<view class="location-bar" :class="{ 'locating': isLocating }" @click="chooseLocation">
						<image class="location-icon" src="/static/img/local-icon.png" mode="widthFix" />
						<view class="location-content">
							<text class="location-text">{{ currentLocation || '定位中…' }}</text>
							<view class="location-arrow">
								<view class="refresh-btn" v-if="isLocating">
									<view class="refresh-spinner"></view>
								</view>
								<image v-else class="arrow-icon" src="/static/img/local-select-icon.png" mode="widthFix" />
							</view>
						</view>
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
 						</view>
 					</view>
 				</view>
 			</mescroll-uni>
 		</template>
 	</view>
 </template>
 
 <script>
 import MescrollMixin from "@/components/mescroll-uni/mescroll-mixins.js";
 import HomeSkeleton from "@/components/skeleton-screen/home-skeleton.vue";
 // 默认兜底坐标（北京天安门）
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
			isLocating: false,
			isLocationReady: false, // 标记定位是否完成
			canHideSkeleton: false, // 是否可以隐藏骨架屏
			waitForSkeletonThenComplete: false, // 是否等待骨架屏时间后完成定位
			firstLocationSet: false, // 标记是否是首次设置位置
			pendingStoreRefresh: false
		};
	},
 	onLoad() {
		// 关闭骨架屏兜底
		setTimeout(() => {
			if (this.pageLoading) this.pageLoading = false;
		}, 5000);
		
		// 开始定位流程
		this.startLocationProcess();
	},
 	onShow() {
 		if (this.storeList.length > 0 && !this.isLocating) this.pageLoading = false;
 		// 从地址选择页返回时同步位置并刷新附近商家
 		this.syncLocationFromStorage();
 	},
 	methods: {
			// 用户手动选过地址后，不再用 GPS 覆盖
			isUserSelectedLocation() {
				const loc = uni.getStorageSync('locationInfo');
				return !!(loc && loc.source === 'user' && loc.lat != null && loc.lng != null);
			},

			applyCachedUserLocation() {
				const cached = uni.getStorageSync('locationInfo');
				if (!cached || cached.lat == null || cached.lng == null) return false;
				const lat = parseFloat(cached.lat);
				const lng = parseFloat(cached.lng);
				if (isNaN(lat) || isNaN(lng)) return false;
				this.latitude = lat;
				this.longitude = lng;
				this.currentLocation = cached.name || this.currentLocation;
				this.firstLocationSet = true;
				return true;
			},

			// 开始定位流程
			startLocationProcess() {
				// 已有用户选择的收货地址：直接用，不重新 GPS（避免把门店距离刷回旧位置）
				if (this.isUserSelectedLocation() && this.applyCachedUserLocation()) {
					this.isLocating = false;
					this.isLocationReady = true;
					this.canHideSkeleton = true;
					this.$nextTick(() => {
						if (this.mescroll) this.mescroll.resetUpScroll();
					});
					return;
				}

				this.currentLocation = "正在获取定位…";
				this.isLocating = true;
				this.isLocationReady = false;
				
				this.skeletonTimeout = setTimeout(() => {
					this.canHideSkeleton = true;
					if (this.waitForSkeletonThenComplete) {
						this.waitForSkeletonThenComplete = false;
						this.locationProcessComplete();
					}
				}, 1000);
				
				this.locationTimeout = setTimeout(() => {
					console.log('定位超时，使用兜底位置');
					this.locationProcessComplete();
				}, 8000);
				
				this.getGpsLocation();
			},
			
			// 定位完成回调（所有定位方式都失败后调用）
			locationProcessComplete() {
				// 清除定位超时定时器
				if (this.locationTimeout) {
					clearTimeout(this.locationTimeout);
					this.locationTimeout = null;
				}
				
				// 如果骨架屏最小显示时间还没到，等待
				if (!this.canHideSkeleton) {
					this.waitForSkeletonThenComplete = true;
					return;
				}
				
				this.isLocating = false;
				this.isLocationReady = true;
				
				// 如果还没有位置，使用缓存或默认地址
				if (!this.latitude || !this.longitude) {
					this.fallbackToCachedLocation();
				}
				
				// 触发门店列表加载
				if (this.mescroll) {
					this.mescroll.resetUpScroll();
				} else {
					this.$nextTick(() => {
						if (this.mescroll) {
							this.mescroll.resetUpScroll();
						}
					});
				}
			},
			
			// 使用缓存位置或默认地址作为兜底
			fallbackToCachedLocation() {
				// 先检查缓存位置
				const cached = uni.getStorageSync('locationInfo');
				if (cached && cached.lat && cached.lng) {
					this.setLocationSilent(cached.lat, cached.lng, cached.name);
					return;
				}
				
				// 再检查默认收货地址
				try {
					const addressList = uni.getStorageSync('addressList') || [];
					const defaultAddress = addressList.find(item => item.isDefault);
					if (defaultAddress && defaultAddress.latitude && defaultAddress.longitude) {
						this.setLocationSilent(
							parseFloat(defaultAddress.latitude),
							parseFloat(defaultAddress.longitude),
							defaultAddress.detailAddress || defaultAddress.address
						);
						return;
					}
				} catch (error) {
					console.error('获取默认地址失败:', error);
				}
				
				// 使用默认坐标
				this.setLocationSilent(DEFAULT_LAT, DEFAULT_LNG, '北京市');
			},
			
			// 静默设置位置（不触发门店刷新）；用户已选手动地址时不覆盖
			setLocationSilent(lat, lng, name) {
				if (this.isUserSelectedLocation()) return;
				this.latitude = lat;
				this.longitude = lng;
				this.currentLocation = name;
				uni.setStorageSync('locationInfo', { name, lat, lng, source: 'gps' });
				uni.setStorageSync('lastLocation', { lat, lng, name });
			},
			
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
			this.currentLocation = "正在获取定位…";
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
			// 继续定位流程，不立即结束
			// 先检查是否有缓存位置
			const cached = uni.getStorageSync('locationInfo');
			if (cached) {
				this.setLocationSilent(cached.lat, cached.lng, cached.name);
				this.locationProcessComplete();
				return;
			}
			
			// 检查是否有默认收货地址
			try {
				const addressList = uni.getStorageSync('addressList') || [];
				const defaultAddress = addressList.find(item => item.isDefault);
				if (defaultAddress && defaultAddress.latitude && defaultAddress.longitude) {
					this.setLocationSilent(
						parseFloat(defaultAddress.latitude),
						parseFloat(defaultAddress.longitude),
						defaultAddress.detailAddress || defaultAddress.address
					);
					this.locationProcessComplete();
					return;
				}
			} catch (error) {
				console.error('获取默认地址失败:', error);
			}
			
			// 如果都没有，使用IP定位
			this.tryIpLocation();
		},
		
		// 尝试IP定位（调用后端接口）
		tryIpLocation(lat, lng) {
			if (this.isUserSelectedLocation()) {
				this.locationProcessComplete();
				return;
			}
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
					this.setLocationSilent(lat, lng, address || '定位成功');
				}
				// 无论成功与否，都结束定位流程
				this.locationProcessComplete();
			}).catch(err => {
				console.error('IP定位失败:', err);
				// 定位失败，结束定位流程（会使用兜底位置）
				this.locationProcessComplete();
			});
		},
		
		
		// 尝试uni-app官方定位API
		tryUniLocation() {
			if (this.isUserSelectedLocation()) {
				this.locationProcessComplete();
				return;
			}
			uni.getLocation({
				type: 'gcj02',
				timeout: 10000,
				success: (res) => {
					const lat = res.latitude;
					const lng = res.longitude;
					alert('获取定位成功')
					alert(JSON.stringify(res))
					this.getAddressByLocation(lat, lng);
				},
				fail: (err) => {
					console.error("uni.getLocation失败:", err);
					// 尝试IP定位
					this.tryIpLocation(39.920279,116.612075);
				}
			});
		},
		
		// 通过坐标获取地址名称（逆地理编码）
		getAddressByLocation(lat, lng) {
			if (this.isUserSelectedLocation()) {
				this.locationProcessComplete();
				return;
			}
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
						this.setLocationSilent(lat, lng, address);
						this.locationProcessComplete();
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
 		
 		// 点击定位栏
		chooseLocation() {
			// 定位中时不允许跳转，提示用户等待定位完成
			if (this.isLocating) {
				uni.showToast({ title: '正在定位中，请稍候', icon: 'none' });
				return;
			}
			// 定位完成后跳转到收货地址选择页面
			this.$Router.push({    
				path: '/pages/user/address/select'
			})
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
		
 		// 保存位置，刷新列表
		setLocation(lat, lng, name) {
			// 记录旧位置用于对比
			const oldLat = this.latitude;
			const oldLng = this.longitude;
			
			this.latitude = lat;
			this.longitude = lng;
			this.currentLocation = name;
			
			// 判断是否是首次设置位置
			const isFirstLocation = !this.firstLocationSet;
			this.firstLocationSet = true;
			
			uni.setStorageSync('locationInfo', { name, lat, lng });
			uni.setStorageSync('lastLocation', { lat, lng, name });
			
			// 如果正在定位流程中，不立即刷新门店列表
			// 等待定位流程完成后统一刷新
			if (this.isLocating) {
				return;
			}
			
			// 定位流程已完成，标记并刷新门店列表
			this.isLocationReady = true;
			if (this.mescroll) {
				this.mescroll.resetUpScroll();
			} else {
				this.$nextTick(() => {
					if (this.mescroll) {
						this.mescroll.resetUpScroll();
					}
				});
			}
		},
		
		// mescroll初始化完成回调
		mescrollInit(mescroll) {
			this.mescroll = mescroll;
			if (this.pendingStoreRefresh || this.isLocationReady) {
				if (this.pendingStoreRefresh) {
					this.storeList = [];
					this.isLoaded = false;
					this.pendingStoreRefresh = false;
				}
				this.mescroll.resetUpScroll();
			}
		},
 		
		/** 重新拉取附近商家（位置变化后距离由接口按 lat/lng 重算） */
		refreshStoreList() {
			this.isLocationReady = true;
			this.isLocating = false;
			this.pageLoading = false;
			if (this.mescroll) {
				this.storeList = [];
				this.isLoaded = false;
				this.mescroll.resetUpScroll();
				this.pendingStoreRefresh = false;
			} else {
				this.pendingStoreRefresh = true;
			}
		},

		/** 从地址页返回：同步位置并强制刷新门店列表 */
		syncLocationFromStorage() {
			try {
				const loc = uni.getStorageSync('locationInfo');
				if (!loc) return;

				const needRefresh = uni.getStorageSync('homeNeedRefresh');
				const name = loc.name || this.currentLocation;
				const lat = loc.lat != null ? parseFloat(loc.lat) : null;
				const lng = loc.lng != null ? parseFloat(loc.lng) : null;
				const hasCoord = lat != null && lng != null && !isNaN(lat) && !isNaN(lng);

				if (needRefresh) {
					uni.removeStorageSync('homeNeedRefresh');
					if (hasCoord) {
						this.latitude = lat;
						this.longitude = lng;
						uni.setStorageSync('lastLocation', { lat, lng, name });
					}
					if (name) this.currentLocation = name;
					this.refreshStoreList();
					return;
				}

				if (hasCoord) {
					const coordsChanged =
						Math.abs((this.latitude || 0) - lat) > 0.00001 ||
						Math.abs((this.longitude || 0) - lng) > 0.00001;
					if (coordsChanged) {
						this.latitude = lat;
						this.longitude = lng;
						this.currentLocation = name;
						uni.setStorageSync('lastLocation', { lat, lng, name });
						this.refreshStoreList();
					} else if (name && this.currentLocation !== name) {
						this.currentLocation = name;
					}
				} else if (name && this.currentLocation !== name) {
					this.currentLocation = name;
				}
			} catch (error) {
				console.error('同步位置失败:', error);
			}
		},
 		
 		downCallback() {
 			this.storeList = [];
 			this.mescroll.resetUpScroll();
 		},
 		
 		upCallback(page) {
			const cached = uni.getStorageSync('locationInfo');
			let lat = this.latitude;
			let lng = this.longitude;
			if (cached && cached.lat != null && cached.lng != null) {
				const clat = parseFloat(cached.lat);
				const clng = parseFloat(cached.lng);
				if (!isNaN(clat) && !isNaN(clng)) {
					lat = clat;
					lng = clng;
					this.latitude = clat;
					this.longitude = clng;
				}
			}
			lat = lat || DEFAULT_LAT;
			lng = lng || DEFAULT_LNG;
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
 		padding: 15rpx 20rpx;
 		background: #fff;
 		.search-box {
 			display: flex;
 			align-items: center;
 			height: 64rpx;
 			padding: 0 24rpx;
 			border-radius: 8rpx;
			border: 1px solid #ff6000;;
 			.placeholder {
 				margin-left: 12rpx;
 				font-size: 28rpx;
 				color: #999;
 			}
 		}
 	}
 	.scroll-content {
 		background: #f5f5f5;
 	}
 	.location-bar {
 		display: flex;
 		align-items: center;
 		padding: 20rpx;
 		background: #fff;
 		border-bottom: 1rpx solid #f0f0f0;
 		transition: opacity 0.3s;
 		
 		&.locating {
 			pointer-events: none;
 			opacity: 0.7;
 		}
 		
 		.location-icon {
 			width: 28rpx;
 			height: 28rpx;
 		}
 		.location-content {
 			flex: 1;
 			min-width: 0;
 			display: flex;
 			align-items: center;
 			margin-left: 12rpx;
 			overflow: hidden;
 		}
 		.location-text {
 			min-width: 0;
 			font-size: 28rpx;
 			color: #000;
 			font-weight: 500;
 			white-space: nowrap;
 			overflow: hidden;
 			text-overflow: ellipsis;
 		}
 		.location-arrow {
 			margin-left: 8rpx;
 			flex-shrink: 0;
 			display: flex;
 			align-items: center;
 		}
 		.arrow-icon {
 			width: 24rpx;
 			height: 24rpx;
 		}
 		.location-right {
 			display: flex;
 			align-items: center;
 			margin-left: 12rpx;
 		}
 		.refresh-btn {
 			width: 32rpx;
 			height: 32rpx;
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
 			.rating { color: #333; font-size: 24rpx; }
 			.sales { margin-left: 20rpx; color: #666; font-size: 24rpx; }
 		}
 		.store-delivery {
 			margin-top: 10rpx;
 			font-size: 24rpx;
 			.delivery-fee { color: #666; margin-right: 20rpx; }
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