<template>
  <view class="city-page">
    <!-- 顶部导航栏 -->
    <TopBar title="选择城市" />
    
    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 热门城市 -->
      <view class="hot-cities">
        <view class="section-title">热门城市</view>
        <view class="city-grid">
          <view 
            class="city-item" 
            v-for="city in hotCities" 
            :key="city"
            :class="{ active: city === currentCity }"
            @click="selectCity(city)"
          >
            {{ city }}
          </view>
        </view>
      </view>
      
      <!-- 城市列表 -->
      <view class="city-list">
        <view class="section-title">全部城市</view>
        <view 
          class="city-item full" 
          v-for="city in allCities" 
          :key="city"
          :class="{ active: city === currentCity }"
          @click="selectCity(city)"
        >
          {{ city }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import TopBar from '@/components/TopBar.vue';

export default {
  components: {
    TopBar
  },
  data() {
    return {
      currentCity: '北京',
      hotCities: ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '重庆'],
      allCities: [
        '北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '重庆',
        '天津', '苏州', '郑州', '长沙', '沈阳', '青岛', '合肥', '济南', '哈尔滨', '福州',
        '昆明', '大连', '厦门', '宁波', '无锡', '佛山', '东莞', '石家庄', '长春', '南宁',
        '常州', '泉州', '温州', '烟台', '唐山', '徐州', '潍坊', '绍兴', '嘉兴', '南通'
      ]
    };
  },
  onLoad() {
    const city = uni.getStorageSync('currentCity');
    if (city) {
      this.currentCity = city;
    }
  },
  methods: {
    selectCity(city) {
      this.currentCity = city;
      uni.setStorageSync('currentCity', city);
      uni.setStorageSync('locationInfo', {
        name: city,
        lat: null,
        lng: null
      });
      uni.showToast({ title: `已切换到${city}`, icon: 'success' });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  }
};
</script>

<style lang="scss" scoped>
.city-page {
  min-height: 100vh;
  background: #f5f6f7;
}

.page-content {
  padding-top: calc(var(--status-bar-height) + 88rpx);
}

.section-title {
  font-size: 28rpx;
  color: #999;
  padding: 20rpx 30rpx;
}

.hot-cities {
  background: #fff;
  margin-bottom: 20rpx;
}

.city-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 30rpx 20rpx;
  gap: 16rpx;
}

.city-item {
  padding: 16rpx 32rpx;
  background: #f5f6f7;
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #333;
  
  &.active {
    background: #ff6000;
    color: #fff;
  }
  
  &.full {
    width: 100%;
    padding: 24rpx 30rpx;
    border-radius: 0;
    border-bottom: 1rpx solid #f0f0f0;
    background: #fff;
    
    &:last-child {
      border-bottom: none;
    }
    
    &.active {
      background: #fff;
      color: #ff6000;
    }
  }
}

.city-list {
  background: #fff;
}
</style>