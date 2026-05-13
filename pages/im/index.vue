<template>
  <view class="message-list">
    <view class="header">
      <text class="header-title">消息</text>
    </view>
    
    <view class="message-container">
      <view class="message-item" v-for="(item, index) in messageList" :key="index" @click="goToChat(item)">
        <image class="avatar" :src="item.avatar || '/static/logo.png'" mode="aspectFill" />
        <view class="message-content">
          <view class="message-header">
            <text class="name">{{ item.name }}</text>
            <text class="time">{{ formatTime(item.lastTime) }}</text>
          </view>
          <view class="message-body">
            <text class="last-message">{{ item.lastMessage }}</text>
            <text class="unread-count" v-if="item.unreadCount > 0">{{ item.unreadCount > 99 ? '99+' : item.unreadCount }}</text>
          </view>
        </view>
      </view>
      
      <view class="empty-state" v-if="messageList.length === 0">
        <text class="empty-icon">💬</text>
        <text class="empty-text">暂无消息</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      messageList: []
    }
  },
  
  onLoad() {
    this.getMessageList()
  },
  
  onShow() {
    this.getMessageList()
  },
  
  onPullDownRefresh() {
    this.getMessageList().finally(() => {
      uni.stopPullDownRefresh()
    })
  },
  
  methods: {
    async getMessageList() {
      try {
        const res = await this.$request.post(this.$apis.message.list)
        if (res.success && res.result) {
          this.messageList = res.result
        }
      } catch (error) {
        console.error('获取消息列表失败:', error)
      }
    },
    
    goToChat(item) {
      uni.navigateTo({
        url: `/pages/im/chat?userId=${item.userId}&userName=${encodeURIComponent(item.name)}&avatar=${encodeURIComponent(item.avatar || '')}`
      })
    },
    
    formatTime(timestamp) {
      if (!timestamp) return ''
      const now = Date.now()
      const diff = now - timestamp
      
      const minute = 60 * 1000
      const hour = 60 * minute
      const day = 24 * hour
      
      if (diff < minute) {
        return '刚刚'
      } else if (diff < hour) {
        return Math.floor(diff / minute) + '分钟前'
      } else if (diff < day) {
        return Math.floor(diff / hour) + '小时前'
      } else if (diff < 7 * day) {
        return Math.floor(diff / day) + '天前'
      } else {
        const date = new Date(timestamp)
        return `${date.getMonth() + 1}/${date.getDate()}`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.message-list {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: #fff;
  padding: 30rpx;
  text-align: center;
  border-bottom: 1rpx solid #eee;
  
  .header-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.message-container {
  padding: 20rpx;
}

.message-item {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 24rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  
  .avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    margin-right: 24rpx;
    flex-shrink: 0;
  }
  
  .message-content {
    flex: 1;
    overflow: hidden;
    
    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12rpx;
      
      .name {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
      
      .time {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .message-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .last-message {
        font-size: 28rpx;
        color: #666;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
      }
      
      .unread-count {
        background: #ff4d4f;
        color: #fff;
        font-size: 20rpx;
        padding: 4rpx 12rpx;
        border-radius: 20rpx;
        min-width: 32rpx;
        text-align: center;
        margin-left: 16rpx;
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  
  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 20rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>