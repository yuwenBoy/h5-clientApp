 <template>
   <view class="home-page">
     <!-- 轮播图 -->
     <swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000">
       <swiper-item v-for="(item, index) in bannerList" :key="index">
         <image class="banner-img" :src="item.image" mode="aspectFill" @click="bannerClick(item)" />
       </swiper-item>
     </swiper>
 
     <!-- 搜索框 -->
     <view class="search-bar" @click="toSearchPage">
       <view class="search-box">
         <uni-icons type="search" size="18" color="#999" />
         <text class="placeholder">搜索商家或商品</text>
       </view>
     </view>
 
     <!-- 分类导航 -->
     <view class="category-nav">
       <view class="category-item" v-for="(item, index) in categoryList" :key="index" @click="categoryClick(item)">
         <image class="category-icon" :src="item.icon" mode="aspectFill" />
         <text class="category-name">{{ item.name }}</text>
       </view>
     </view>
 
     <!-- 推荐商家列表 -->
     <view class="store-section">
       <view class="section-title">附近商家</view>
       
       <!-- Mescroll组件 -->
       <mescroll-uni ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="upCallback" :top="300">
         <!-- 数据列表 -->
         <view class="store-list" v-if="storeList.length > 0">
           <view class="store-item" v-for="(store, index) in storeList" :key="store.id" @click="toStoreDetail(store)">
             <!-- 商家图片 -->
             <image class="store-image" :src="store.logo || 'http://image.jxxqz.com:3001/fc57d5031095495fae039977ec738d01.jpeg'" mode="aspectFill" />
             
             <!-- 商家信息 -->
             <view class="store-info">
               <view class="store-header">
                 <text class="store-name">{{ store.storeName }}</text>
                 <text class="store-distance">{{ store.distance || 1 }}km</text>
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
         
         <!-- 空数据状态 -->
         <view class="empty-box" v-if="storeList.length === 0 && isLoaded">
           <image class="empty-icon" src="/static/images/empty.png" mode="aspectFill" />
           <text class="empty-text">暂无附近商家</text>
         </view>
       </mescroll-uni>
     </view>
   </view>
 </template>
 
 <script>
 import MescrollMixin from "@/components/mescroll-uni/mescroll-mixins.js";
 
 export default {
   mixins: [MescrollMixin], // 使用mescroll分页混入
   
   data() {
     return {
       // 轮播图数据
       bannerList: [
         { image: 'https://picsum.photos/750/300?random=1', link: '' },
         { image: 'https://picsum.photos/750/300?random=2', link: '' },
         { image: 'https://picsum.photos/750/300?random=3', link: '' }
       ],
       
       // 分类数据
       categoryList: [
         { id: 1, name: '美食', icon: '/static/images/category/food.png' },
         { id: 2, name: '超市', icon: '/static/images/category/market.png' },
         { id: 3, name: '鲜花', icon: '/static/images/category/flower.png' },
         { id: 4, name: '药品', icon: '/static/images/category/medicine.png' },
         { id: 5, name: '跑腿', icon: '/static/images/category/errand.png' }
       ],
       
       // 商家列表数据
       storeList: [],
       
       // 是否已加载过数据
       isLoaded: false
     };
   },
   
   methods: {
     // 下拉刷新
     downCallback() {
       // 重置列表数据
       this.storeList = [];
       // 重新加载第一页
       this.mescroll.resetUpScroll();
     },
     
     // 上拉加载
     upCallback(page) {
       console.log('加载第' + page.num + '页, 每页' + page.size + '条');
       
       // 请求参数
       const params = {
         page: page.num,
         size: page.size,
         latitude: uni.getStorageSync('latitude') || '39.9042', // 用户纬度
         longitude: uni.getStorageSync('longitude') || '116.4074' // 用户经度
       };
			        
       // 调用接口获取商家列表
       this.$request.post(this.$apis.index.storeList,params).then(res => {
         // 接口返回的curPageData必须为数组
         const curPageData = res.result.content || [];
         const totalSize = res.result.totalElements || 0;
         
         // 如果是第一页，清空数据
         if (page.num === 1) {
           this.storeList = [];
         }
         
         // 追加数据
         this.storeList = this.storeList.concat(curPageData);
         this.isLoaded = true;
         
         // 告诉mescroll加载成功
         this.mescroll.endSuccess(curPageData.length, totalSize);
       }).catch(err => {
         console.error('加载失败', err);
         // 告诉mescroll加载失败
         this.mescroll.endErr();
       });
     },
     
     // 搜索页面
     toSearchPage() {
       uni.navigateTo({
         url: '/pages/search/search'
       });
     },
     
     // 分类点击
     categoryClick(category) {
       uni.navigateTo({
         url: `/pages/category/category?id=${category.id}&name=${category.name}`
       });
     },
     
     // 商家详情
     toStoreDetail(store) {
       uni.navigateTo({
         url: `/pages/store/detail?id=${store.id}`
       });
     },
     
     // 轮播图点击
     bannerClick(item) {
       if (item.link) {
         uni.navigateTo({
           url: item.link
         });
       }
     }
   }
 };
 </script>
 
 <style lang="scss" scoped>
 .home-page {
   min-height: 100vh;
   background-color: #f5f5f5;
 }
 
 // 轮播图
 .banner-swiper {
   width: 100%;
   height: 300rpx;
   
   .banner-img {
     width: 100%;
     height: 100%;
   }
 }
 
 // 搜索栏
 .search-bar {
   padding: 20rpx 30rpx;
   background-color: #fff;
   
   .search-box {
     display: flex;
     align-items: center;
     height: 72rpx;
     padding: 0 24rpx;
     background-color: #f2f2f2;
     border-radius: 36rpx;
     
     .placeholder {
       margin-left: 12rpx;
       font-size: 28rpx;
       color: #999;
     }
   }
 }
 
 // 分类导航
 .category-nav {
   display: flex;
   padding: 30rpx 0;
   background-color: #fff;
   overflow-x: auto;
   
   .category-item {
     flex-shrink: 0;
     display: flex;
     flex-direction: column;
     align-items: center;
     width: 120rpx;
     
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
 
 // 商家区块
 .store-section {
   background-color: #fff;
   margin-top: 20rpx;
   
   .section-title {
     padding: 30rpx;
     font-size: 32rpx;
     font-weight: bold;
     color: #333;
     border-bottom: 1rpx solid #eee;
   }
 }
 
 // 商家列表
 .store-list {
   .store-item {
     display: flex;
     padding: 30rpx;
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
     color: #666;
     
     .delivery-fee {
       margin-right: 20rpx;
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
 
 // 空状态
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
