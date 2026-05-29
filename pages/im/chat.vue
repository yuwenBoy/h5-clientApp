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
          :class="parseInt(msg.senderId) === parseInt(currentUserId) ? 'message-self' : 'message-other'"
        >
          <image 
            class="avatar" 
            :src="parseInt(msg.senderId) === parseInt(currentUserId) ? currentUserAvatar : targetUserAvatar" 
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
import socketClient from '@/utils/socket.js'

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
      socketConnected: false
    }
  },
  
  onLoad(options) {
    // 使用 $Route 获取参数，兼容多种方式
    let query = {}
    
    // 方式1：直接从options获取（onLoad传入）
    if (options && Object.keys(options).length > 0) {
      query = options
    }
    // 方式2：从$Route获取（刷新页面时）
    else if (this.$Route && this.$Route.query) {
      query = this.$Route.query
    }
    // 方式3：从URL解析（H5刷新时）
    else if (typeof window !== 'undefined' && window.location) {
      const search = window.location.search.substring(1)
      if (search) {
        query = search.split('&').reduce((acc, pair) => {
          const [key, value] = pair.split('=')
          acc[key] = decodeURIComponent(value || '')
          return acc
        }, {})
      }
    }
    
    this.userId = query.userId || query.receiverId || ''
    this.userName = decodeURIComponent(query.userName || '')
    this.userAvatar = decodeURIComponent(query.avatar || '')
    this.orderId = query.orderId || ''
    
    // 优先使用URL参数中的fromUserId或senderId，否则使用本地存储中的userId（带项目前缀）
    const projectName = 'jxxqz-h5'
    this.currentUserId = query.fromUserId || query.senderId || uni.getStorageSync(projectName + '_userId') || ''
    this.currentUserAvatar = uni.getStorageSync(projectName + '_userAvatar') || '/static/logo.png'
    this.targetUserAvatar = this.userAvatar || '/static/logo.png'
    
    console.log('聊天页面参数:', query)
    console.log('currentUserId:', this.currentUserId)
    console.log('targetUserId:', this.userId)
    
    // 只有当有目标用户时才初始化WebSocket
    if (this.userId && this.currentUserId) {
      this.getMessageHistory()
      this.markAsRead()
      this.initWebSocket()
    } else {
      console.error('缺少必要参数：userId或currentUserId为空')
    }
  },
  
  onUnload() {
    this.closeWebSocket()
  },
  
  methods: {
    async getMessageHistory() {
      try {
        console.log('获取消息历史 - 当前用户ID:', this.currentUserId)
        console.log('获取消息历史 - 目标用户ID:', this.userId)
        
        const res = await this.$request.post(this.$apis.message.history, {
          targetUserId: parseInt(this.userId)
        })
        
        console.log('获取消息历史 - 接口响应:', JSON.stringify(res))
        
        if (res.success && res.result) {
          this.messageList = res.result
          console.log('获取消息历史 - 消息列表:', this.messageList)
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        } else {
          console.log('获取消息历史 - 响应不成功或无数据:', res)
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
      
      if (!this.socketConnected) {
        uni.showToast({ title: '连接中，请稍候...', icon: 'none' })
        return
      }
      
      const content = this.inputMessage.trim()
      
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
        // 发送私聊消息，匹配后端事件名 private_message
        socketClient.send('private_message', {
          receiverId: parseInt(this.userId),
          content: content,
          targetId: parseInt(this.userId), // 目标ID：对方用户ID
          targetType: 1 // 目标类型：用户类型（1表示用户）
        })
        // 发送成功后清空输入框
        this.inputMessage = ''
      } catch (error) {
        console.error('WebSocket发送失败:', error)
        uni.showToast({ title: '发送失败', icon: 'none' })
        this.messageList.pop()
      }
    },
    
    initWebSocket() {
      // 等待socket.io客户端加载完成
      this.waitForSocketIO(() => {
        // 构建WebSocket连接地址（匹配后端NestJS配置）
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
        const host = location.hostname
        // 后端WebSocket服务运行在端口9000（固定）
        const port = '9000'
        // 后端配置：命名空间 /chat，路径 /socket.io
        // socket.io会自动处理命名空间，这里使用socket.io客户端的方式
        const socketUrl = `${protocol}//${host}:${port}`
        
        console.log('WebSocket连接地址:', socketUrl)
        socketClient.init(socketUrl, this.currentUserId)
        
        socketClient.on('connect', () => {
          console.log('WebSocket连接成功')
          this.socketConnected = true
        })
        
        socketClient.on('disconnect', () => {
          console.log('WebSocket断开连接')
          this.socketConnected = false
        })
        
        socketClient.on('new_message', (message) => {
          console.log('收到新消息:', message)
          this.handleNewMessage(message)
        })
        
        socketClient.on('message_sent', (message) => {
          console.log('消息发送成功:', message)
        })
        
        socketClient.on('error', (error) => {
          console.error('WebSocket错误:', error)
          this.socketConnected = false
        })
      })
    },
    
    waitForSocketIO(callback) {
      const maxWait = 10000 // 最多等待10秒
      const interval = 200 // 每200ms检查一次
      let elapsed = 0
      
      const check = () => {
        if (typeof window !== 'undefined' && window.io) {
          console.log('socket.io客户端已就绪')
          callback()
        } else if (elapsed < maxWait) {
          elapsed += interval
          setTimeout(check, interval)
        } else {
          console.error('socket.io客户端加载超时，将使用轮询方式')
          callback()
        }
      }
      
      check()
    },
    
    handleNewMessage(message) {
      if (message && message.senderId !== this.currentUserId) {
        this.messageList.push(message)
        this.$nextTick(() => {
          this.scrollToBottom()
        })
        // 标记已读
        this.markAsRead()
      }
    },
    
    closeWebSocket() {
      try {
        socketClient.off('connect')
        socketClient.off('disconnect')
        socketClient.off('message')
        socketClient.off('error')
      } catch (error) {
        console.error('关闭WebSocket监听失败:', error)
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
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    
    goBack() {
      uni.navigateBack({
        fail: () => {
          uni.switchTab({
            url: '/pages/home/home'
          })
        }
      })
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
  height: 88rpx;
  background: #fff;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #eee;
  
  .header-left {
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
    
    .header-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
    }
  }
  
  .header-right {
    width: 80rpx;
    display: flex;
    justify-content: flex-end;
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
      background: #ff4d4f;
      color: #fff;
      margin-right: 16rpx;
      margin-left: 0;
      border-bottom-right-radius: 4rpx;
    }
    
    .message-info {
      text-align: right;
    }
  }
  
  &.message-other {
    .message-bubble {
      background: #fff;
      color: #333;
      margin-left: 16rpx;
      margin-right: 0;
      border-bottom-left-radius: 4rpx;
    }
    
    .message-info {
      text-align: left;
    }
  }
  
  .avatar {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    flex-shrink: 0;
    background: #ddd;
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
      padding: 20rpx 28rpx;
      border-radius: 24rpx;
      word-wrap: break-word;
      word-break: break-all;
      
      .message-text {
        font-size: 28rpx;
        line-height: 1.6;
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
  padding: 12rpx 16rpx;
  padding-bottom: calc(12rpx + env(safe-area-inset-bottom));
  
  .input-wrapper {
    display: flex;
    align-items: center;
    
    .message-input {
      flex: 1;
      height: 80rpx;
      padding: 0 24rpx;
      background: #f5f5f5;
      border: none;
      border-radius: 40rpx;
      font-size: 28rpx;
      box-sizing: border-box;
    }
    
    .send-btn {
      width: 100rpx;
      height: 80rpx;
      margin-left: 16rpx;
      background: #ff4d4f;
      color: #fff;
      border: none;
      border-radius: 8rpx;
      font-size: 28rpx;
      line-height: 80rpx;
      text-align: center;
      flex-shrink: 0;
    }
  }
}
</style>