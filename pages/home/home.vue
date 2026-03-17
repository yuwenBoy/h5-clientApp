 <template>
   <view class="home-page">
     <!-- 吸顶搜索框 -->
     <view class="search-bar-sticky">
       <view class="search-box" @click="toSearchPage">
         <uni-icons type="search" size="18" color="#999" />
         <text class="placeholder">搜索商家或商品</text>
       </view>
     </view>
 
     <!-- 定位信息 -->
     <view class="location-bar" @click="chooseLocation">
       <uni-icons type="location-filled" size="16" color="#ff6000" />
       <text class="location-text">{{ currentLocation || '点击选择位置' }}</text>
       <uni-icons type="right" size="14" color="#999" />
     </view>
 
     <!-- 轮播图 -->
     <swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000">
       <swiper-item v-for="(item, index) in bannerList" :key="index">
         <image class="banner-img" :src="item.image" mode="aspectFill" @click="bannerClick(item)" />
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
 
     <!-- 推荐商家列表 -->
     <view class="store-section">
       <view class="section-title">附近商家</view>
       <view class="store-list-wrapper">
         <mescroll-uni ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="upCallback" :top="'auto'" :height="'auto'" :fixed="false">
           <view class="store-list" v-if="storeList.length > 0">
             <view class="store-item" v-for="(store, index) in storeList" :key="store.id" @click="toStoreDetail(store)">
               <image class="store-image" :src="store.logo || 'http://image.jxxqz.com:3001/fc57d5031095495fae039977ec738d01.jpeg'" mode="aspectFill" />
               <view class="store-info">
                 <view class="store-header">
                   <text class="store-name">{{ store.storeName }}</text>
                   <text class="store-distance">{{ store.distance || 1 }}km · {{ store.delivery_time || '30分钟' }}</text>
                 </view>
                 <view class="store-meta">
                   <text class="rating">⭐ {{ store.rating || 3 }}</text>
                   <text class="sales">月售{{ store.monthly_sales || 1000 }}</text>
                 </view>
                 <view class="store-delivery">
                   <text class="delivery-fee">配送 ¥{{ store.delivery_fee || 1.5 }}</text>
                   <text class="min-order">起送 ¥{{ store.min_order_amount || 15 }}</text>
                 </view>
                 <view class="store-tags" v-if="store.tags">
                   <text class="tag" v-for="tag in store.tags" :key="tag">{{ tag }}</text>
                 </view>
               </view>
             </view>
           </view>
           <view class="empty-box" v-if="storeList.length === 0 && isLoaded">
             <image class="empty-icon" src="/static/images/empty.png" mode="aspectFill" />
             <text class="empty-text">暂无附近商家</text>
           </view>
         </mescroll-uni>
       </view>
     </view>
   </view>
 </template>
 
 <script>
 import MescrollMixin from "@/components/mescroll-uni/mescroll-mixins.js";
 
 const TENCENT_KEY = '6TCBZ-CZ36V-SGJP7-5RHL3-Y5XWE-ZPFUO';
 
 // 常用城市坐标库（H5端使用）
 const CITY_COORDS = {
   '北京': { lat: 39.9042, lng: 116.4074 },
   '上海': { lat: 31.2304, lng: 121.4737 },
   '广州': { lat: 23.1291, lng: 113.2644 },
   '深圳': { lat: 22.5431, lng: 114.0579 },
   '杭州': { lat: 30.2741, lng: 120.1551 },
   '南京': { lat: 32.0603, lng: 118.7969 },
   '成都': { lat: 30.5728, lng: 104.0668 },
   '武汉': { lat: 30.5928, lng: 114.3055 },
   '西安': { lat: 34.3416, lng: 108.9398 },
   '重庆': { lat: 29.5630, lng: 106.5516 }
 };
 
 export default {
   mixins: [MescrollMixin],
   
   data() {
     return {
       currentLocation: '',
       latitude: '',
       longitude: '',
       bannerList: [
         { image: 'https://picsum.photos/750/300?random=1', link: '' },
         { image: 'https://picsum.photos/750/300?random=2', link: '' },
         { image: 'https://picsum.photos/750/300?random=3', link: '' }
       ],
       categoryList: [
         { id: 1, name: '美食', icon: 'https://picsum.photos/120/120?random=1'},
         { id: 2, name: '超市', icon: 'https://picsum.photos/120/120?random=2'},
         { id: 3, name: '鲜花', icon: 'https://picsum.photos/120/120?random=3'},
         { id: 4, name: '药品', icon: 'https://picsum.photos/120/120?random=4'},
         { id: 5, name: '跑腿', icon: 'https://picsum.photos/120/120?random=5'},
         { id: 6, name: '水果', icon: 'https://picsum.photos/120/120?random=6'},
         { id: 7, name: '奶茶', icon: 'https://picsum.photos/120/120?random=7'},
         { id: 8, name: '更多', icon: 'https://picsum.photos/120/120?random=8'}
       ],
       storeList: [],
       isLoaded: false
     };
   },
   
   onLoad() {
     // 恢复缓存位置
     const cached = uni.getStorageSync('locationInfo');
     if (cached) {
       this.currentLocation = cached.name;
       this.latitude = cached.latitude;
       this.longitude = cached.longitude;
     } else {
       this.currentLocation = '点击选择位置';
       // App/小程序自动定位
       // #ifndef H5
       this.getAppLocation();
       // #endif
     }
   },
   
   methods: {
     // 选择位置
     chooseLocation() {
       // #ifdef H5
       // H5：使用内置城市选择
       this.chooseLocationH5();
       // #endif
       
       // #ifndef H5
       // App/小程序：原生地图选择
       this.chooseLocationApp();
       // #endif
     },
     
     // H5端选择位置（无跨域问题）
     chooseLocationH5() {
       const cityList = Object.keys(CITY_COORDS);
       
       uni.showActionSheet({
         title: '选择城市',
         itemList: cityList,
         success: (res) => {
           const city = cityList[res.tapIndex];
           const coord = CITY_COORDS[city];
           
           // 弹出输入框填写详细地址
           uni.showModal({
             title: '详细地址',
             editable: true,
             placeholderText: `请输入${city}的详细地址（如：朝阳区三里屯）`,
             success: (modalRes) => {
               if (modalRes.confirm) {
                 const detail = modalRes.content || '';
                 this.currentLocation = detail ? `${city}·${detail}` : city;
                 this.latitude = coord.lat;
                 this.longitude = coord.lng;
                 
                 // 保存
                 uni.setStorageSync('latitude', coord.lat);
                 uni.setStorageSync('longitude', coord.lng);
                 uni.setStorageSync('locationInfo', {
                   name: this.currentLocation,
                   latitude: coord.lat,
                   longitude: coord.lng
                 });
                 
                 // 刷新列表
                 this.mescroll && this.mescroll.resetUpScroll();
               }
             }
           });
         }
       });
     },
     
     // App/小程序端选择位置
     chooseLocationApp() {
       uni.chooseLocation({
         latitude: this.latitude || undefined,
         longitude: this.longitude || undefined,
         success: (res) => {
           this.setLocation(res.latitude, res.longitude, res.name || res.address);
         },
         fail: () => {
           uni.showToast({ title: '请选择位置', icon: 'none' });
         }
       });
     },
     
     // App/小程序自动定位
     getAppLocation() {
       uni.showLoading({ title: '定位中...' });
       
       uni.getLocation({
         type: 'gcj02',
         isHighAccuracy: true,
         success: (res) => {
           // 解析地址
           this.reverseGeocoder(res.latitude, res.longitude);
         },
         fail: () => {
           this.currentLocation = '点击选择位置';
           uni.hideLoading();
         }
       });
     },
     
     // 坐标转地址（App/小程序，使用HTTP请求）
     reverseGeocoder(latitude, longitude) {
       uni.request({
         url: 'https://apis.map.qq.com/ws/geocoder/v1/',
         data: {
           location: `${latitude},${longitude}`,
           key: TENCENT_KEY,
           get_poi: 1
         },
         success: (res) => {
           uni.hideLoading();
           if (res.data.status === 0) {
             const result = res.data.result;
             const name = result.formatted_addresses?.recommend || 
                         result.address_component?.street || 
                         result.address || 
                         '当前位置';
             this.setLocation(latitude, longitude, name);
           } else {
             this.setLocation(latitude, longitude, '当前位置');
           }
         },
         fail: () => {
           uni.hideLoading();
           this.setLocation(latitude, longitude, '当前位置');
         }
       });
     },
     
     // 设置位置
     setLocation(lat, lng, name) {
       this.latitude = lat;
       this.longitude = lng;
       this.currentLocation = name;
       uni.setStorageSync('latitude', lat);
       uni.setStorageSync('longitude', lng);
       uni.setStorageSync('locationInfo', {
         name: name,
         latitude: lat,
         longitude: lng
       });
       this.mescroll && this.mescroll.resetUpScroll();
     },
     
     // 下拉刷新
     downCallback() {
       this.storeList = [];
       this.mescroll.resetUpScroll();
     },
     
     // 上拉加载
     upCallback(page) {
       const params = {
         page: page.num,
         size: page.size,
         latitude: this.latitude || uni.getStorageSync('latitude') || '39.9042',
         longitude: this.longitude || uni.getStorageSync('longitude') || '116.4074'
       };
       
       this.$request.post(this.$apis.index.storeList, params).then(res => {
         const curPageData = res.result.content || [];
         const totalSize = res.result.totalElements || 0;
         
         if (page.num === 1) {
           this.storeList = [];
         }
         
         this.storeList = this.storeList.concat(curPageData);
         this.isLoaded = true;
         this.mescroll.endSuccess(curPageData.length, totalSize);
       }).catch(err => {
         console.error('加载失败', err);
         this.mescroll.endErr();
       });
     },
     
     toSearchPage() {
       uni.navigateTo({ url: '/pages/home/search' });
     },
     
     categoryClick(category) {
       uni.navigateTo({
         url: `/pages/home/category?id=${category.id}&name=${category.name}`
       });
     },
     
     toStoreDetail(store) {
       uni.navigateTo({ url: `/pages/home/storeDetail?id=${store.id}` });
     },
     
     bannerClick(item) {
       if (item.link) uni.navigateTo({ url: item.link });
     }
   }
 };
 </script>
 
 <style lang="scss" scoped>
 .home-page {
   min-height: 100vh;
   background-color: #f5f5f5;
 }
 
 .search-bar-sticky {
   position: sticky;
   top: 0;
   z-index: 999;
   padding: 15rpx 30rpx 10rpx;
   background-color: #fff;
   box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
   
   .search-box {
     display: flex;
     align-items: center;
     height: 64rpx;
     padding: 0 24rpx;
     background-color: #f2f2f2;
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
   background-color: #fff;
   border-bottom: 1rpx solid #f0f0f0;
   
   .location-text {
     flex: 1;
     margin-left: 10rpx;
     font-size: 28rpx;
     color: #333;
     white-space: nowrap;
     overflow: hidden;
     text-overflow: ellipsis;
     padding-right: 10rpx;
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
   width: 100%;
   background-color: #fff;
   white-space: nowrap;
 }
 
 .category-nav {
   display: flex;
   flex-direction: row;
   padding: 30rpx 0;
   
   .category-item {
     flex-shrink: 0;
     display: flex;
     flex-direction: column;
     align-items: center;
     width: 150rpx;
     padding: 0 10rpx;
     
     .category-icon {
       width: 80rpx;
       height: 80rpx;
       border-radius: 40rpx;
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
     color: #333;
     border-bottom: 1rpx solid #eee;
     background-color: #fff;
   }
   
   .store-list-wrapper {
     min-height: calc(100vh - 860rpx);
     overflow: visible;
   }
 }
 
 .store-list {
   .store-item {
     display: flex;
     padding: 30rpx;
     border-bottom: 1rpx solid #f0f0f0;
     margin-bottom: 10rpx;
     background-color: #fff;
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
     align-items: center;
     
     .store-name {
       font-size: 32rpx;
       font-weight: bold;
       color: #333;
     }
     
     .store-distance {
       font-size: 24rpx;
       color: #999;
     }
   }
   
   .store-meta {
     margin-top: 10rpx;
     
     .rating {
       font-size: 24rpx;
       color: #ff6000;
     }
     
     .sales {
       margin-left: 20rpx;
       font-size: 24rpx;
       color: #666;
     }
   }
   
   .store-delivery {
     margin-top: 10rpx;
     font-size: 24rpx;
     
     .delivery-fee {
       margin-right: 20rpx;
       color: #ff6000;
       font-weight: 500;
     }
     
     .min-order {
       color: #666;
     }
   }
   
   .store-tags {
     margin-top: 10rpx;
     
     .tag {
       display: inline-block;
       padding: 4rpx 12rpx;
       margin-right: 10rpx;
       font-size: 20rpx;
       color: #ff6000;
       background-color: #fff7f0;
       border-radius: 4rpx;
     }
   }
 }
 
 .empty-box {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: 100rpx 0;
   
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