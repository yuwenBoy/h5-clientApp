<template>
  <view class="top-bar">
    <view class="top-bar-left" @click="handleBack" v-if="showBack">
      <image class="back-icon" src="/static/img/back-icon.png" mode="widthFix" />
    </view>
    <view class="top-bar-title">{{ title }}</view>
    <view class="top-bar-right">
      <slot name="right"></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TopBar',
  props: {
    title: {
      type: String,
      default: ''
    },
    showBack: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    handleBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack();
      } else {
        uni.switchTab({
          url: '/pages/home/home'
        });
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  background: #fff;
  padding-top: env(safe-area-inset-top);
  
  .top-bar-left {
    position: absolute;
    left: 20rpx;
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .back-icon {
    width: 36rpx;
    height: 36rpx;
  }
  
  .top-bar-title {
    font-size: 34rpx;
    font-weight: 500;
    color: #333;
  }
  
  .top-bar-right {
    position: absolute;
    right: 20rpx;
  }
}
</style>