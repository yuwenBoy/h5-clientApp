<template>
  <view v-if="visible" class="modal-overlay" @click="close">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="modal-title">{{ title }}</text>
        <view class="modal-close" @click="close">
          <text class="close-icon">×</text>
        </view>
      </view>
      <view class="modal-body">
        <view 
          class="modal-item" 
          v-for="(item, index) in items" 
          :key="index" 
          @click="handleItemClick(item)"
        >
          <view class="item-left">
            <text class="item-icon" :class="{ 'small-icon': smallIcons }">{{ item.icon }}</text>
            <text class="item-text">{{ item.text }}</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ContactModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    items: {
      type: Array,
      default: () => []
    },
    smallIcons: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    handleItemClick(item) {
      this.$emit('select', item)
      this.close()
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
  
  .modal-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
  
  .modal-close {
    position: absolute;
    right: 30rpx;
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .close-icon {
      font-size: 40rpx;
      color: #999;
    }
  }
}

.modal-body {
  padding: 16rpx 0;
}

.modal-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  
  &:active {
    background: #f5f5f5;
  }
  
  .item-left {
    display: flex;
    align-items: center;
    
    .item-icon {
      font-size: 36rpx;
      margin-right: 20rpx;
      
      &.small-icon {
        font-size: 32rpx;
      }
    }
    
    .item-text {
      font-size: 30rpx;
      color: #333;
    }
  }
  
  .item-arrow {
    font-size: 32rpx;
    color: #ccc;
  }
}
</style>
