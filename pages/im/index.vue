<template>
  <view class="message-list">
    <view class="message-container">
      <view class="message-item" v-for="(item, index) in messageList" :key="index" @click="goToChat(item)">
        <image class="avatar" :src="item.avatar || '/static/logo.png'" mode="aspectFill" />
        <view class="message-content">
          <view class="message-header">
            <text class="name">{{ item.userId == 19 ? '系统客服':item.name }}</text>
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
import socketClient from '@/utils/socket.js'

export default {
  data() {
    return {
      messageList: [],
      currentUserId: ''
    }
  },
  
  onLoad() {
    this.getCurrentUserId()
    this.getMessageList()
    this.initWebSocket()
  },
  
  onShow() {
    this.getMessageList()
  },
  
  onUnload() {
    // 页面卸载时移除监听
    socketClient.off('new_message')
  },
  
  onPullDownRefresh() {
    this.getMessageList().finally(() => {
      uni.stopPullDownRefresh()
    })
  },
  
  methods: {
    getCurrentUserId() {
      const projectName = 'jxxqz-h5'
      const userInfo = this.$utils.getStorage('userInfo')
      let tempCurrentUserId = userInfo?.id || userInfo?.userId || ''
      
      if (!tempCurrentUserId) {
        tempCurrentUserId = uni.getStorageSync(projectName + '_userId') || uni.getStorageSync('userId') || ''
      }
      
      this.currentUserId = tempCurrentUserId
    },
    
    initWebSocket() {
      // 等待 socket.io 客户端加载完成
      this.waitForSocketIO(() => {
        socketClient.on('new_message', (message) => {
          console.log('消息列表页收到新消息:', message)
          // 更新消息列表中的未读数量
          this.handleNewMessage(message)
        })
      })
    },
    
    waitForSocketIO(callback) {
      if (typeof socketClient !== 'undefined' && socketClient.init) {
        callback()
      } else {
        setTimeout(() => this.waitForSocketIO(callback), 100)
      }
    },
    
    handleNewMessage(message) {
      // 如果是自己发送的消息，不增加未读数
      if (message.senderId == this.currentUserId) {
        return
      }
      
      // 查找对应的会话
      const conversation = this.messageList.find(item => item.userId == message.senderId)
      
      if (conversation) {
        // 会话已存在，更新最后一条消息和未读数
        conversation.lastMessage = message.content
        conversation.lastTime = message.createTime || Date.now()
        conversation.unreadCount = (conversation.unreadCount || 0) + 1
        
        // 移动到列表顶部
        this.messageList = this.messageList.filter(item => item.userId != message.senderId)
        this.messageList.unshift(conversation)
      } else {
        // 新会话，添加到列表顶部
        const newConversation = {
          userId: message.senderId,
          name: `用户${message.senderId}`,
          avatar: message.senderAvatar || '',
          lastMessage: message.content,
          lastTime: message.createTime || Date.now(),
          unreadCount: 1,
          isBusiness: false
        }
        this.messageList.unshift(newConversation)
      }
    },
    
    async getMessageList() {
      try {
        const res = await this.$request.post(this.$apis.message.list)
        if (res.success && res.result) {
          this.messageList = res.result
          this.messageList.forEach(item=>{
            item.name = item.userId == 19 ? '系统客服':item.name
          })
        }
      } catch (error) {
        console.error('获取消息列表失败:', error)
      }
    },
    
    goToChat(item) {
      let _userName = item.name
      this.$Router.push({
        path: '/pages/im/chat',
        query: {
          userId: item.userId,
          userName: encodeURIComponent(_userName),
          isBusiness: item.isBusiness
        }
      })
      
      // 进入聊天页面后，清除该会话的未读数
      const conversation = this.messageList.find(c => c.userId == item.userId)
      if (conversation) {
        conversation.unreadCount = 0
      }
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