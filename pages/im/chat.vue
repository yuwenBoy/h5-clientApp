<template>
  <view class="chat-page">
    <view class="chat-header">
      <view class="header-left" @click="goBack">
        <text class="cuIcon-back header-icon"></text>
      </view>
      <view class="header-center">
        <text class="header-title">{{ userName }}</text>
      </view>
      <view class="header-right"></view>
    </view>
    
    <scroll-view class="chat-content" scroll-y :scroll-into-view="scrollIntoView" :scroll-with-animation="true">
      <view class="message-list">
        <view 
          class="message-item" 
          v-for="(msg, index) in messageList" 
          :key="index"
          :id="'msg-' + index"
          :class="msg.senderId === currentUserId ? 'message-self' : 'message-other'"
        >
          <image 
            class="avatar" 
            :src="msg.senderId === currentUserId ? currentUserAvatar : targetUserAvatar" 
            mode="aspectFill" 
          />
          <view class="message-wrapper">
            <view class="message-info">
              <text class="message-time">{{ formatMessageTime(msg.createTime) }}</text>
            </view>
            <view class="message-bubble">
              <text class="message-text">{{ msg.content }}</text>
            </view>
          </view>
        </view>
        
        <view class="empty-state" v-if="messageList.length === 0">
          <text class="empty-text">暂无消息，开始聊天吧</text>
        </view>
      </view>
    </scroll-view>
    
    <view class="chat-footer">
      <view class="input-wrapper">
        <textarea 
          class="message-input" 
          v-model="inputMessage" 
          placeholder="输入消息..."
          :auto-height="true"
          :maxlength="500"
          @confirm="sendMessage"
        />
        <button class="send-btn" @click="sendMessage" :disabled="!inputMessage.trim()">发送</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userId: '',
      userName: '',
      userAvatar: '',
      orderId: '',
      currentUserId: '',
      currentUserAvatar: '',
      targetUserAvatar: '',
      messageList: [],
      inputMessage: '',
      scrollIntoView: '',
      timer: null
    }
  },
  
  onLoad(options) {
    this.userId = options.userId || ''
    this.userName = decodeURIComponent(options.userName || '')
    this.userAvatar = decodeURIComponent(options.avatar || '')
    this.orderId = options.orderId || ''
    
    this.currentUserId = uni.getStorageSync('userId') || ''
    this.currentUserAvatar = uni.getStorageSync('userAvatar') || '/static/logo.png'
    this.targetUserAvatar = this.userAvatar || '/static/logo.png'
    
    this.getMessageHistory()
    this.markAsRead()
    this.startPolling()
  },
  
  onUnload() {
    this.stopPolling()
  },
  
  methods: {
    async getMessageHistory() {
      try {
        const res = await this.$request.post(this.$apis.message.history, {
          targetUserId: parseInt(this.userId),
          orderId: this.orderId ? parseInt(this.orderId) : null
        })
        
        if (res.success && res.result) {
          this.messageList = res.result
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }
      } catch (error) {
        console.error('获取消息历史失败:', error)
      }
    },
    
    async markAsRead() {
      try {
        await this.$request.post(this.$apis.message.markRead, {
          targetUserId: parseInt(this.userId)
        })
      } catch (error) {
        console.error('标记已读失败:', error)
      }
    },
    
    async sendMessage() {
      if (!this.inputMessage.trim()) {
        return
      }
      
      const content = this.inputMessage.trim()
      this.inputMessage = ''
      
      const tempMessage = {
        senderId: this.currentUserId,
        receiverId: this.userId,
        content: content,
        createTime: Date.now(),
        orderId: this.orderId ? parseInt(this.orderId) : null
      }
      
      this.messageList.push(tempMessage)
      this.$nextTick(() => {
        this.scrollToBottom()
      })
      
      try {
        const res = await this.$request.post(this.$apis.message.send, tempMessage)
        if (!res.success) {
          uni.showToast({ title: res.message || '发送失败', icon: 'none' })
          this.messageList.pop()
        }
      } catch (error) {
        console.error('发送消息失败:', error)
        uni.showToast({ title: '发送失败', icon: 'none' })
        this.messageList.pop()
      }
    },
    
    startPolling() {
      this.timer = setInterval(() => {
        this.getMessageHistory()
      }, 3000)
    },
    
    stopPolling() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    
    scrollToBottom() {
      if (this.messageList.length > 0) {
        this.scrollIntoView = 'msg-' + (this.messageList.length - 1)
      }
    },
    
    formatMessageTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${hours}:${minutes}`
    },
    
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
  padding: 0 20rpx;
  
  .header-left, .header-right {
    width: 80rpx;
    display: flex;
    align-items: center;
  }
  
  .header-icon {
    font-size: 40rpx;
    color: #333;
  }
  
  .header-center {
    flex: 1;
    text-align: center;
    
    .header-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 20rpx;
}

.message-list {
  min-height: 100%;
}

.message-item {
  display: flex;
  margin-bottom: 30rpx;
  
  &.message-self {
    flex-direction: row-reverse;
    
    .message-wrapper {
      align-items: flex-end;
    }
    
    .message-bubble {
      background: #07c160;
      color: #fff;
      margin-right: 20rpx;
      margin-left: 0;
    }
    
    .message-info {
      text-align: right;
    }
  }
  
  &.message-other {
    .message-bubble {
      background: #fff;
      color: #333;
      margin-left: 20rpx;
      margin-right: 0;
    }
    
    .message-info {
      text-align: left;
    }
  }
  
  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    flex-shrink: 0;
  }
  
  .message-wrapper {
    display: flex;
    flex-direction: column;
    max-width: 70%;
    
    .message-info {
      margin-bottom: 8rpx;
      
      .message-time {
        font-size: 22rpx;
        color: #999;
      }
    }
    
    .message-bubble {
      padding: 20rpx 24rpx;
      border-radius: 16rpx;
      word-wrap: break-word;
      word-break: break-all;
      
      .message-text {
        font-size: 28rpx;
        line-height: 1.5;
      }
    }
  }
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

.chat-footer {
  background: #fff;
  border-top: 1rpx solid #eee;
  padding: 20rpx;
  
  .input-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 20rpx;
    
    .message-input {
      flex: 1;
      min-height: 80rpx;
      max-height: 200rpx;
      padding: 20rpx;
      background: #f5f5f5;
      border-radius: 12rpx;
      font-size: 28rpx;
      line-height: 1.5;
    }
    
    .send-btn {
      width: 120rpx;
      height: 80rpx;
      background: #07c160;
      color: #fff;
      border: none;
      border-radius: 12rpx;
      font-size: 28rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:disabled {
        background: #ccc;
      }
    }
  }
}
</style>