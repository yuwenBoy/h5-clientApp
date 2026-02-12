<template>
  <view class="home-page">
    <!-- 1. 吸顶搜索框 -->
    <view class="search-bar-sticky">
      <view class="search-box" @click="toSearchPage">
        <uni-icons type="search" size="18" color="#999" />
        <text class="placeholder">搜索商家或商品</text>
      </view>
    </view>

    <!-- 2. 定位信息 -->
    <view class="location-bar" @click="chooseLocation">
      <uni-icons type="location-filled" size="16" color="#ff6000" />
      <text class="location-text">{{ currentLocation || '获取定位中...' }}</text>
      <uni-icons type="right" size="14" color="#999" />
    </view>

    <!-- 3. 轮播图 -->
    <swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000">
      <swiper-item v-for="(item, index) in bannerList" :key="index">
        <image class="banner-img" :src="item.image" mode="aspectFill" @click="bannerClick(item)" />
      </swiper-item>
    </swiper>

    <!-- 4. 分类导航 -->
    <view class="category-nav">
      <view class="category-item" v-for="(item, index) in categoryList" :key="index" @click="categoryClick(item)">
        <image class="category-icon" :src="item.icon" mode="aspectFill" />
        <text class="category-name">{{ item.name }}</text>
      </view>
    </view>

    <!-- 5. 推荐商家列表 -->
    <view class="store-section">
      <view class="section-title">附近商家</view>
      <view class="store-list-wrapper">
				<!-- Mescroll组件 -->
				<mescroll-uni ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="upCallback" :top="'auto'" :height="'auto'" :fixed="false">
				  <!-- 数据列表 -->
				  <view class="store-list" v-if="storeList.length > 0">
				    <view class="store-item" v-for="(store, index) in storeList" :key="store.id" @click="toStoreDetail(store)">
				      <!-- 商家图片 -->
				      <image class="store-image" :src="store.logo || 'http://image.jxxqz.com:3001/fc57d5031095495fae039977ec738d01.jpeg'" mode="aspectFill" />
				      
				      <!-- 商家信息 -->
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
				  
				  <!-- 空数据状态 -->
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

export default {
  mixins: [MescrollMixin],
  
  data() {
    return {
      // 当前定位
      currentLocation: '北京市朝阳区',
      
      // 顶部固定区域高度（用于mescroll定位）
      topBarHeight: 180, // 搜索(50) + 定位(40) + banner(150) + 分类(100) ≈ 340rpx ≈ 170px
      
      // 轮播图数据
      bannerList: [
        { image: 'https://picsum.photos/750/300?random=1', link: '' },
        { image: 'https://picsum.photos/750/300?random=2', link: '' },
        { image: 'https://picsum.photos/750/300?random=3', link: '' }
      ],
      
      // 分类数据
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
      
      // 商家列表数据
      storeList: [],
      
      // 是否已加载过数据
      isLoaded: false
    };
  },
  
  methods: {
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
        latitude: uni.getStorageSync('latitude') || '39.9042',
        longitude: uni.getStorageSync('longitude') || '116.4074'
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
    
    // 选择定位
    chooseLocation() {
      uni.chooseLocation({
        success: (res) => {
          this.currentLocation = res.name || res.address;
          uni.setStorageSync('latitude', res.latitude);
          uni.setStorageSync('longitude', res.longitude);
          // 重新加载商家列表
          this.mescroll.resetUpScroll();
        },
        fail: () => {
          uni.showToast({ title: '请授权位置权限', icon: 'none' });
        }
      });
    },
    
    // 其他方法...
    toSearchPage() {
      uni.navigateTo({ url: '/pages/search/search' });
    },
    categoryClick(category) {
      uni.navigateTo({
        url: `/pages/category/category?id=${category.id}&name=${category.name}`
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

// 1. 吸顶搜索框
.search-bar-sticky {
  position: sticky;
  top: 0;
  z-index: 999;
	padding: 15rpx 30rpx 10rpx;  // 上下留点呼吸感
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

// 2. 定位栏
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

// 3. 轮播图
.banner-swiper {
  width: 100%;
  height: 300rpx;
  
  .banner-img {
    width: 100%;
    height: 100%;
  }
}

// 4. 分类导航（横向滑动）
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

// 5. 商家区块
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
	.store-list-wrapper{
		min-height: calc(100vh - 860rpx);
		overflow: visible;
	}
}

// 商家列表样式（保持不变）
.store-list {
  .store-item {
    display: flex;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
		margin-bottom: 10rpx;
		background-color:#FFFFFF;  // 加 !important 强制生效
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
     color: #ff6000;  // 配送费高亮
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
