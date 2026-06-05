<template>
	<view class="chat-page">
		<view class="chat-header">
			<view class="header-left" @click="goBack">
				<text class="cuIcon-back header-icon"></text>
			</view>
			<view class="header-center">
				<text class="header-title">{{ userName }}</text>
			</view>
			<view class="header-right">
				<image v-if="isBusiness" src="/static/img/store-icon.png" mode="aspectFit" @click="goToShop" />
			</view>
		</view>

		<scroll-view class="chat-content" scroll-y :scroll-into-view="scrollIntoView" :scroll-with-animation="false">
			<view class="message-list">
				<view v-for="(msg, index) in messageList" :key="index">
					<!-- 时间戳居中显示 -->
					<view class="time-divider">
						<text class="time-text">{{ formatMessageTime(msg.createTime) }}</text>
					</view>
					<view class="message-item" :id="'msg-' + index"
						:class="isSelfMessage(msg) ? 'message-self' : 'message-other'">
						<image class="avatar" :src="isSelfMessage(msg) ? currentUserAvatar : targetUserAvatar" mode="aspectFill" />
						<view class="message-wrapper">
							<view class="message-bubble">
								<text class="message-text">{{ msg.content }}</text>
							</view>
							<!-- 已读/未读状态 -->
							<view class="read-status" v-if="isSelfMessage(msg)">
								<text class="read-text" :class="{ 'read': msg.isRead }">
									{{ msg.isRead ? '已读' : '未读' }}
								</text>
							</view>
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
				<textarea class="message-input" v-model="inputMessage" placeholder="输入消息..." :auto-height="true"
					:maxlength="500" @confirm="sendMessage" />
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
				socketConnected: false,
				isBusiness: false,
				storeId: null, // 门店id
			}
		},

		onLoad(options) {
			// 使用 $Route 获取参数，兼容多种方式
			let query = JSON.parse(options.query)
			this.userId = query.userId
			this.userName = decodeURIComponent(query.userName || '')
			this.userAvatar = decodeURIComponent(query.avatar || '')
			this.orderId = query.orderId || ''
			this.isBusiness = query.storeId || query.isBusiness

			// 优先使用 URL 参数中的 fromUserId 或 senderId，否则使用本地存储中的 userId（带项目前缀）
			const projectName = 'jxxqz-h5'
			const userInfo = this.$utils.getStorage('userInfo')
			let tempCurrentUserId = query.fromUserId || query.senderId || ''
			console.log('聊天页面 - 从 URL 获取的 ID:', tempCurrentUserId)

			if (!tempCurrentUserId && userInfo) {
				tempCurrentUserId = userInfo.id || userInfo.userId || ''
				console.log('聊天页面 - 从 userInfo 获取的 ID:', tempCurrentUserId)
			}

			if (!tempCurrentUserId) {
				tempCurrentUserId = uni.getStorageSync(projectName + '_userId') || uni.getStorageSync('userId') || ''
				console.log('聊天页面 - 从 storage 获取的 ID:', tempCurrentUserId)
			}

			this.currentUserId = tempCurrentUserId

			this.currentUserAvatar = this.$utils.getStorage('userAvatar') || (userInfo ? userInfo.avatar : '') ||
				'/static/logo.png'
			this.targetUserAvatar = this.userAvatar || '/static/logo.png'

			// 只有当有目标用户时才初始化WebSocket
			if (this.userId && this.currentUserId) {
				this.getMessageHistory()
				this.initWebSocket()
			} else {
				console.error('缺少必要参数：userId或currentUserId为空')
			}
		},
		
		onShow() {
			// 添加页面可见性监听（不自动发送已读标记）
			this.addVisibilityListener()
		},
		
		onHide() {
			// 页面隐藏时移除监听
			this.removeVisibilityListener()
		},
		
		addVisibilityListener() {
			// 监听页面可见性变化
			document.addEventListener('visibilitychange', this.handleVisibilityChange)
			// 立即检查一次页面可见性
			this.handleVisibilityChange()
		},
		
		removeVisibilityListener() {
			// 移除页面可见性监听
			document.removeEventListener('visibilitychange', this.handleVisibilityChange)
		},
		
		handleVisibilityChange() {
			// 当页面从隐藏变为可见时发送已读标记
			if (!document.hidden && this.userId && this.currentUserId) {
				console.log('页面变为可见，发送已读标记')
				this.sendMarkAsRead()
			}
		},
		mounted() {
			const projectName = 'jxxqz-h5'
			const userInfo = this.$utils.getStorage('userInfo')
			this.currentUserId = this.$Route.query.fromUserId || this.$Route.query.senderId || (userInfo ? (userInfo.id ||
				userInfo.userId) : '') || uni.getStorageSync(projectName + '_userId') || uni.getStorageSync('userId') || ''
			this.userId = this.$Route.query.userId
			this.storeId = this.$Route.query.storeId
		  this.isBusiness = query.storeId || query.isBusiness
			if (this.userId && this.currentUserId) {
				this.getMessageHistory()
			}
		},
		onUnload() {
			this.closeWebSocket()
		},

		methods: {
			goToShop() {
				this.$Router.push({
					path: '/pages/home/storeDetail',
					query: {
						id: this.storeId,
					}
				})
			},

			async getMessageHistory() {
				try {
					const res = await this.$request.post(this.$apis.message.history, {
						targetUserId: parseInt(this.userId)
					})
					if (res.success && res.result) {
						this.messageList = res.result
						console.log('获取消息历史 - 消息列表:', JSON.stringify(this.messageList))
						this.messageList.forEach((msg, idx) => {
							console.log(`消息${idx}: senderId=${msg.senderId}, content=${msg.content}`)
						})
						
						// 将当前用户发送的消息设置为已读显示（用户自己发送的消息在打开聊天窗口时就显示已读）
						this.messageList = this.messageList.map(msg => {
							const senderId = parseInt(msg.senderId || msg.fromUserId || msg.fromId || 0)
							const currentId = parseInt(this.currentUserId)
							if (senderId === currentId) {
								return { ...msg, isRead: true }
							}
							return msg
						})
						
						this.$nextTick(() => {
							this.scrollToBottom()
						})
						// 延迟发送已读标记，确保消息列表已更新且WebSocket已连接
						setTimeout(() => {
							this.sendMarkAsRead()
						}, 500)
					} else {
						console.log('获取消息历史 - 响应不成功或无数据:', res)
					}
				} catch (error) {
					console.error('获取消息历史失败:', error)
				}
			},

			sendMarkAsRead() {
				// 通过WebSocket发送标记已读事件
				// targetId应该是消息发送者的ID（对方用户），即this.userId
				if (this.socketConnected && this.userId) {
					console.log('========== 发送标记已读事件 ==========')
					console.log('当前用户ID（阅读者）:', this.currentUserId)
					console.log('对方用户ID（消息发送者）:', this.userId)
					console.log('消息列表中我的消息:', this.messageList.filter(m => m.senderId == this.currentUserId))
					socketClient.send('mark_conversation_read', {
						targetId: parseInt(this.userId), // 消息发送者ID（对方）
						targetType: 1 // 用户类型
					})
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
					uni.showToast({
						title: '连接中，请稍候...',
						icon: 'none'
					})
					return
				}

				const content = this.inputMessage.trim()

				const tempMessage = {
					senderId: this.currentUserId,
					receiverId: this.userId,
					content: content,
					createTime: Date.now(),
					orderId: this.orderId ? parseInt(this.orderId) : null,
					isRead: false // 发送时始终显示未读，等待对方打开窗口发送已读回执
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
					uni.showToast({
						title: '发送失败',
						icon: 'none'
					})
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

					socketClient.on('message_read', (data) => {
						console.log('========== 收到已读通知 ==========')
						console.log('message_read - 数据:', data)
						this.handleReadMessage(data)
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
				if (message) {
					const senderId = message.senderId || message.fromUserId || message.fromId || 0
					if (parseInt(senderId) !== parseInt(this.currentUserId)) {
						this.messageList.push(message)
						this.$nextTick(() => {
							this.scrollToBottom()
						})
						// 只有当页面可见时才发送已读标记
						if (!document.hidden) {
							this.sendMarkAsRead()
						}
					}
				}
			},

			handleReadMessage(data) {
				// 更新消息的已读状态
				console.log('========== 处理已读通知 ==========')
				console.log('handleReadMessage - 数据:', data)
				console.log('handleReadMessage - 当前用户ID:', this.currentUserId)
				console.log('handleReadMessage - 对方用户ID:', this.userId)
				
				if (data && data.readerId) {
					const readerId = parseInt(data.readerId)
					console.log('handleReadMessage - readerId:', readerId)
					console.log('handleReadMessage - this.userId:', parseInt(this.userId))
					
					// 如果是对方（this.userId）阅读了消息，更新我发送的消息状态
					if (readerId === parseInt(this.userId)) {
						console.log('handleReadMessage - 条件满足，开始更新消息状态')
						console.log('handleReadMessage - 更新前消息列表:', JSON.stringify(this.messageList))
						
						// 使用Vue.set触发响应式更新
						this.messageList = this.messageList.map(msg => {
							const msgSenderId = parseInt(msg.senderId || msg.fromUserId || msg.fromId || 0)
							const msgReceiverId = parseInt(msg.receiverId || msg.toUserId || msg.toId || 0)
							console.log(`handleReadMessage - 消息: senderId=${msgSenderId}, receiverId=${msgReceiverId}, isRead=${msg.isRead}`)
							
							// 更新我发送给对方的消息为已读
							if (msgSenderId === parseInt(this.currentUserId) && msgReceiverId === parseInt(this.userId)) {
								console.log(`handleReadMessage - 更新消息为已读: content=${msg.content.substring(0, 20)}...`)
								return { ...msg, isRead: true }
							}
							return msg
						})
						
						console.log('handleReadMessage - 更新后消息列表:', JSON.stringify(this.messageList))
					} else {
						console.log('handleReadMessage - 条件不满足，readerId !== this.userId')
					}
				} else {
					console.log('handleReadMessage - data.readerId 为空')
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

			isSelfMessage(msg) {
				const senderId = msg.senderId || msg.fromUserId || msg.fromId || 0
				const currentId = parseInt(this.currentUserId)
				const msgSenderId = parseInt(senderId)
				return msgSenderId === currentId
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
			width: 60rpx;
			display: flex;
			align-items: center;
		}

		.header-icon {
			font-size: 40rpx;
			color: #333;
		}

		.header-center {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: space-between;
			min-width: 0;

			.header-title {
				font-size: 32rpx;
				font-weight: 500;
				color: #333;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				flex-shrink: 1;
			}
		}

		.header-right {
			width: 50rpx;
			display: flex;
			height: 50rpx;
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

	.time-divider {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 20rpx 0;

		.time-text {
			font-size: 22rpx;
			color: #999;
			padding: 8rpx 20rpx;
			background: rgba(0, 0, 0, 0.05);
			border-radius: 20rpx;
		}
	}

	.message-item {
		display: flex;
		margin-bottom: 30rpx;

		&.message-self {
			flex-direction: row-reverse;

			.message-wrapper {
				align-items: flex-end;
				padding-right: 20rpx;
			}

			.message-bubble {
				background: #ff4d4f;
				color: #fff;
				margin-left: 16rpx;
				margin-right: 0;
				border-bottom-right-radius: 4rpx;
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

			.read-status {
				padding: 8rpx 0;
				display: flex;
				justify-content: flex-end;

				.read-text {
					font-size: 22rpx;
					color: #999;

					&.read {
						color: #999;
					}
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
		padding: 16rpx 20rpx;
		padding-bottom: calc(16rpx + env(safe-area-inset-bottom));

		.input-wrapper {
			display: flex;
			align-items: center;

			.message-input {
				flex: 1;
				padding: 16rpx 28rpx;
				background: #f5f5f5;
				border: none;
				border-radius: 8rpx;
				font-size: 30rpx;
				box-sizing: border-box;
				line-height: 1.5;
			}

			.send-btn {
				width: 120rpx;
				height: 88rpx;
				margin-left: 20rpx;
				background: #ff4d4f;
				color: #fff;
				border: none;
				border-radius: 8rpx;
				font-size: 30rpx;
				line-height: 88rpx;
				text-align: center;
				flex-shrink: 0;
			}
		}
	}
</style>