<template>
  <view class="order-detail">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>
    
    <template v-else>
      <!-- 状态头部 -->
      <view class="status-header" :class="getStatusClass(order.orderStatus)">
        <view class="status-text">{{ order.orderStatusText || getStatusText(order.orderStatus) }}</view>
        <view class="status-desc">{{ getStatusDesc(order.orderStatus) }}</view>
      </view>

      <!-- 骑手信息（配送中显示） -->
      <view class="rider-card" v-if="order.riderName && (order.orderStatus === 4 || order.orderStatus === 5)">
        <view class="rider-header">
          <text class="cuIcon-deliver_fill rider-icon"></text>
          <text class="rider-title">配送信息</text>
        </view>
        <view class="rider-info">
          <text class="rider-name">{{ order.riderName }}</text>
          <text class="rider-phone" @click="callRider(order.riderPhone)">{{ order.riderPhone }}</text>
          <text class="cuIcon-phone rider-phone-icon"></text>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="info-card">
        <view class="card-title">订单信息</view>
        <view class="info-item">
          <text class="info-label">订单编号</text>
          <text class="info-value">{{ order.orderNo }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">创建时间</text>
          <text class="info-value">{{ formatDateTime(order.createTime) }}</text>
        </view>
        <view class="info-item" v-if="order.payTime">
          <text class="info-label">支付时间</text>
          <text class="info-value">{{ formatDateTime(order.payTime) }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">支付方式</text>
          <text class="info-value">{{ formatPayMethod(order.payMethod) }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">配送时间</text>
          <text class="info-value">{{ order.deliveryTime || '尽快送达' }}</text>
        </view>
        <view class="info-item" v-if="order.remark">
          <text class="info-label">订单备注</text>
          <text class="info-value remark">{{ order.remark }}</text>
        </view>
        <view class="info-item" v-if="order.cancelReason">
          <text class="info-label">取消原因</text>
          <text class="info-value cancel-reason">{{ order.cancelReason }}</text>
        </view>
      </view>

      <!-- 门店信息 -->
      <view class="store-card" v-if="order.storeName">
        <image class="store-logo" :src="storeLogo" mode="aspectFill" />
        <view class="store-text">
          <view class="store-name">{{ order.storeName }}</view>
          <view class="store-desc">商家配送 | 预计30分钟送达</view>
        </view>
      </view>

      <!-- 商品列表 -->
      <view class="goods-card">
        <view class="card-title">商品信息</view>
        <view class="goods-item" v-for="(item, i) in order.goods" :key="i">
          <image class="goods-img" :src="item.img || '/static/logo.png'" mode="aspectFill" />
          <view class="goods-info">
            <view class="goods-name">{{ item.productName }}</view>
            <view class="goods-spec" v-if="item.specName">{{ item.specName }}</view>
          </view>
          <view class="goods-count">x{{ item.count }}</view>
          <view class="goods-price">¥{{ item.price }}</view>
        </view>
      </view>

      <!-- 金额明细 -->
      <view class="price-card">
        <view class="card-title">金额明细</view>
        <view class="price-item">
          <text>商品总价</text>
          <text>¥{{ order.goodsTotal }}</text>
        </view>
        <view class="price-item">
          <text>配送费</text>
          <text>¥{{ order.deliveryFee || 0 }}</text>
        </view>
        <view class="price-item" v-if="order.discount > 0">
          <text>店铺优惠</text>
          <text class="discount">-¥{{ order.discount }}</text>
        </view>
        <view class="price-item" v-if="order.couponDiscount > 0">
          <text>优惠券</text>
          <text class="discount">-¥{{ order.couponDiscount }}</text>
        </view>
        <view class="price-total">
          <text>实付金额</text>
          <text class="total-price">¥{{ order.finalTotal }}</text>
        </view>
      </view>

      <!-- 收货信息 -->
      <view class="address-card">
        <view class="card-title">收货信息</view>
        <view class="address-item">
          <text class="cuIcon-people address-icon"></text>
          <text>收货人：{{ order.addressName }}</text>
        </view>
        <view class="address-item">
          <text class="cuIcon-phone address-icon"></text>
          <text>联系电话：{{ order.addressPhone }}</text>
        </view>
        <view class="address-item">
          <text class="cuIcon-location address-icon"></text>
          <text>收货地址：{{ order.addressDetail }}</text>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="bottom-bar" v-if="showBottomBar">
        <!-- 待支付 -->
        <template v-if="order.orderStatus === 0">
          <button class="bottom-btn line" @click="cancelOrder">取消订单</button>
          <button class="bottom-btn primary" @click="toPay">立即支付</button>
        </template>
        
        <!-- 待接单 -->
        <template v-else-if="order.orderStatus === 1">
          <button class="bottom-btn line" @click="cancelOrder">取消订单</button>
          <button class="bottom-btn primary" disabled>等待商家接单</button>
        </template>
        
        <!-- 备货中 -->
        <template v-else-if="order.orderStatus === 2">
          <button class="bottom-btn primary" disabled>商家备货中</button>
        </template>
        
        <!-- 待配送 -->
        <template v-else-if="order.orderStatus === 3">
          <button class="bottom-btn primary" disabled>等待配送</button>
        </template>
        
        <!-- 配送中 -->
        <template v-else-if="order.orderStatus === 4">
          <button class="bottom-btn primary" @click="confirmReceipt">确认收货</button>
        </template>
        
        <!-- 已完成 -->
        <template v-else-if="order.orderStatus === 5">
          <button class="bottom-btn line" @click="applyRefund">申请退款</button>
          <button class="bottom-btn primary" @click="backHome">再次下单</button>
        </template>
        
        <!-- 已取消 -->
        <template v-else-if="order.orderStatus === 6 || order.orderStatus === 7">
          <button class="bottom-btn primary" @click="backHome">重新下单</button>
        </template>
      </view>
    </template>
  </view>
</template>

<script>
// 订单状态常量
const OrderStatus = {
  UNPAID: 0,           // 待支付
  PENDING_ACCEPT: 1,   // 待接单
  ACCEPTED_PREPARE: 2, // 备货中
  DAIPEISONG: 3,       // 待配送
  PEISONGZHONG: 4,     // 配送中
  YIWANCHENG: 5,       // 已完成
  CANCELED_MANUAL: 6,  // 已取消（人工）
  CANCELED_TIMEOUT: 7, // 超时关闭
  REFUND_ALL_PART: 8   // 已退款
}

export default {
  data() {
    return {
      orderId: null,
      loading: true,
      storeLogo: '/static/logo.png',
      order: {
        orderNo: '',
        orderStatus: 0,
        orderStatusText: '',
        createTime: '',
        payMethod: '',
        payStatus: 0,
        payTime: null,
        deliveryTime: '尽快送达',
        storeId: null,
        storeName: '',
        goodsTotal: 0,
        deliveryFee: 0,
        discount: 0,
        couponDiscount: 0,
        finalTotal: 0,
        remark: '',
        addressName: '',
        addressPhone: '',
        addressDetail: '',
        riderId: null,
        riderName: '',
        riderPhone: '',
        cancelReason: '',
        goods: []
      }
    }
  },
  computed: {
    showBottomBar() {
      // 已取消、超时关闭、已退款状态下不显示底部按钮
      const hiddenStatuses = [OrderStatus.CANCELED_MANUAL, OrderStatus.CANCELED_TIMEOUT, OrderStatus.REFUND_ALL_PART]
      return !hiddenStatuses.includes(this.order.orderStatus)
    }
  },
  onLoad(options) {
    this.orderId = options.id || options.orderId
    if (this.orderId) {
      this.getOrderDetail()
    } else {
      uni.showToast({ title: '订单ID不存在', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 1500)
    }
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.getOrderDetail().finally(() => {
      uni.stopPullDownRefresh()
    })
  },
  methods: {
    // 获取订单详情
    async getOrderDetail() {
      this.loading = true
      try {
        const res = await this.$request.post(this.$apis.order.detail, {
          orderId: parseInt(this.orderId)
        })
        
        if (res.success && res.result) {
          const order = res.result
          
          // 处理图片URL
          if (order.goods && order.goods.length > 0) {
            order.goods = order.goods.map(item => {
              if (item.img) {
                item.img = this.$utils.processImageUrl ? this.$utils.processImageUrl(item.img) : item.img
              }
              return item
            })
          }
          
          this.order = order
        } else {
          uni.showToast({ title: res.message || '获取订单详情失败', icon: 'none' })
        }
      } catch (error) {
        console.error('获取订单详情失败:', error)
        uni.showToast({ title: '获取订单详情失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        [OrderStatus.UNPAID]: '待支付',
        [OrderStatus.PENDING_ACCEPT]: '待接单',
        [OrderStatus.ACCEPTED_PREPARE]: '备货中',
        [OrderStatus.DAIPEISONG]: '待配送',
        [OrderStatus.PEISONGZHONG]: '配送中',
        [OrderStatus.YIWANCHENG]: '已完成',
        [OrderStatus.CANCELED_MANUAL]: '已取消',
        [OrderStatus.CANCELED_TIMEOUT]: '超时关闭',
        [OrderStatus.REFUND_ALL_PART]: '已退款'
      }
      return statusMap[status] || '未知状态'
    },
    
    // 获取状态描述
    getStatusDesc(status) {
      const descMap = {
        [OrderStatus.UNPAID]: '请尽快完成支付',
        [OrderStatus.PENDING_ACCEPT]: '商家正在接单中',
        [OrderStatus.ACCEPTED_PREPARE]: '商家正在准备商品',
        [OrderStatus.DAIPEISONG]: '商品已备好，等待配送',
        [OrderStatus.PEISONGZHONG]: '骑手正在配送中',
        [OrderStatus.YIWANCHENG]: '订单已完成，感谢您的光临',
        [OrderStatus.CANCELED_MANUAL]: '订单已取消',
        [OrderStatus.CANCELED_TIMEOUT]: '订单超时关闭',
        [OrderStatus.REFUND_ALL_PART]: '订单已退款'
      }
      return descMap[status] || ''
    },
    
    // 获取状态样式类
    getStatusClass(status) {
      const classMap = {
        [OrderStatus.UNPAID]: 'wait',
        [OrderStatus.PENDING_ACCEPT]: 'pending',
        [OrderStatus.ACCEPTED_PREPARE]: 'prepare',
        [OrderStatus.DAIPEISONG]: 'delivery',
        [OrderStatus.PEISONGZHONG]: 'delivering',
        [OrderStatus.YIWANCHENG]: 'finish',
        [OrderStatus.CANCELED_MANUAL]: 'cancel',
        [OrderStatus.CANCELED_TIMEOUT]: 'cancel',
        [OrderStatus.REFUND_ALL_PART]: 'cancel'
      }
      return classMap[status] || 'wait'
    },
    
    // 格式化支付方式
    formatPayMethod(method) {
      const methodMap = {
        'wechat': '微信支付',
        'alipay': '支付宝',
        'balance': '余额支付',
        '': '未支付'
      }
      return methodMap[method] || method || '未支付'
    },
    
    // 格式化日期时间
    formatDateTime(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-')
    },
    
    // 拨打骑手电话
    callRider(phone) {
      if (!phone) return
      uni.makePhoneCall({
        phoneNumber: phone,
        fail: () => {
          uni.showToast({ title: '拨打电话失败', icon: 'none' })
        }
      })
    },
    
    // 取消订单
    async cancelOrder() {
      uni.showModal({
        title: '确认取消',
        content: '确定取消该订单吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await this.$request.post(this.$apis.order.cancel, {
                orderId: parseInt(this.orderId),
                cancelReason: '用户主动取消'
              })
              
              if (result.success) {
                uni.showToast({ title: '取消成功', icon: 'success' })
                setTimeout(() => this.getOrderDetail(), 1500)
              } else {
                uni.showToast({ title: result.message || '取消失败', icon: 'none' })
              }
            } catch (error) {
              console.error('取消订单失败:', error)
              uni.showToast({ title: '取消失败', icon: 'none' })
            }
          }
        }
      })
    },
    
    // 去支付
    toPay() {
      uni.navigateTo({
        url: `/pages/order/pay?orderId=${this.orderId}&total=${this.order.finalTotal}`
      })
    },
    
    // 确认收货
    async confirmReceipt() {
      uni.showModal({
        title: '确认收货',
        content: '确认已收到商品吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await this.$request.post('/client/order/confirm-receipt', {
                orderId: parseInt(this.orderId)
              })
              
              if (result.success) {
                uni.showToast({ title: '确认成功', icon: 'success' })
                setTimeout(() => this.getOrderDetail(), 1500)
              } else {
                uni.showToast({ title: result.message || '确认失败', icon: 'none' })
              }
            } catch (error) {
              console.error('确认收货失败:', error)
              uni.showToast({ title: '确认失败', icon: 'none' })
            }
          }
        }
      })
    },
    
    // 申请退款
    applyRefund() {
      uni.showModal({
        title: '申请退款',
        content: '确定要申请退款吗？',
        editable: true,
        placeholderText: '请输入退款原因',
        success: async (res) => {
          if (res.confirm && res.content) {
            try {
              const result = await this.$request.post('/client/order/apply-refund', {
                orderId: parseInt(this.orderId),
                reason: res.content
              })
              
              if (result.success) {
                uni.showToast({ title: '申请已提交', icon: 'success' })
                setTimeout(() => this.getOrderDetail(), 1500)
              } else {
                uni.showToast({ title: result.message || '申请失败', icon: 'none' })
              }
            } catch (error) {
              console.error('申请退款失败:', error)
              uni.showToast({ title: '申请失败', icon: 'none' })
            }
          }
        }
      })
    },
    
    // 返回首页
    backHome() {
      uni.switchTab({ url: '/pages/home/home' })
    }
  }
}
</script>

<style lang="scss" scoped>
$primary: #ff6b35;

.order-detail {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 140rpx;
}

// 加载状态
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  .loading-text {
    color: #999;
    font-size: 28rpx;
  }
}

// 状态头部
.status-header {
  padding: 50rpx 30rpx;
  text-align: center;
  color: #fff;
  
  &.wait { background: linear-gradient(135deg, #ff6b35, #ff8f5a); }
  &.pending { background: linear-gradient(135deg, #ff9500, #ffb84d); }
  &.prepare { background: linear-gradient(135deg, #5ac8fa, #81d4fa); }
  &.delivery { background: linear-gradient(135deg, #007aff, #5ac8fa); }
  &.delivering { background: linear-gradient(135deg, #5856d6, #a29bfe); }
  &.finish { background: linear-gradient(135deg, #34c759, #30d158); }
  &.cancel { background: linear-gradient(135deg, #8e8e93, #c7c7cc); }
  
  .status-text {
    font-size: 44rpx;
    font-weight: bold;
    margin-bottom: 12rpx;
  }
  .status-desc {
    font-size: 26rpx;
    opacity: 0.9;
  }
}

// 骑手信息卡片
.rider-card {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  
  .rider-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .rider-icon {
      font-size: 36rpx;
      color: $primary;
      margin-right: 12rpx;
    }
    .rider-title {
      font-size: 30rpx;
      font-weight: bold;
    }
  }
  
  .rider-info {
    display: flex;
    align-items: center;
    background: #f8f8f8;
    padding: 24rpx;
    border-radius: 12rpx;
    
    .rider-name {
      font-size: 30rpx;
      font-weight: bold;
      margin-right: 20rpx;
    }
    .rider-phone {
      flex: 1;
      font-size: 28rpx;
      color: #666;
    }
    .rider-phone-icon {
      font-size: 40rpx;
      color: $primary;
      padding: 16rpx;
    }
  }
}

// 通用卡片样式
.info-card, .store-card, .goods-card, .price-card, .address-card {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 24rpx;
  color: #333;
}

// 订单信息
.info-item {
  display: flex;
  justify-content: space-between;
  padding: 18rpx 0;
  font-size: 26rpx;
  
  &:not(:last-child) {
    border-bottom: 1rpx solid #f5f5f5;
  }
  
  .info-label {
    color: #999;
  }
  .info-value {
    color: #333;
    flex: 1;
    text-align: right;
    margin-left: 20rpx;
    word-break: break-all;
    
    &.remark {
      color: $primary;
    }
    &.cancel-reason {
      color: #999;
    }
  }
}

// 门店信息
.store-card {
  display: flex;
  align-items: center;
  
  .store-logo {
    width: 80rpx;
    height: 80rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
    background: #f5f5f5;
  }
  .store-text {
    flex: 1;
  }
  .store-name {
    font-size: 30rpx;
    font-weight: bold;
    margin-bottom: 8rpx;
    color: #333;
  }
  .store-desc {
    font-size: 24rpx;
    color: #999;
  }
}

// 商品列表
.goods-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  font-size: 26rpx;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
  
  .goods-img {
    width: 100rpx;
    height: 100rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
    background: #f5f5f5;
  }
  
  .goods-info {
    flex: 1;
    min-width: 0;
    
    .goods-name {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 8rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .goods-spec {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .goods-count {
    color: #999;
    margin: 0 24rpx;
    font-size: 26rpx;
  }
  
  .goods-price {
    font-weight: bold;
    color: #333;
    font-size: 28rpx;
  }
}

// 金额明细
.price-item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  font-size: 26rpx;
  color: #666;
  
  .discount {
    color: #34c759;
  }
}

.price-total {
  display: flex;
  justify-content: space-between;
  padding-top: 24rpx;
  margin-top: 16rpx;
  border-top: 2rpx dashed #eee;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  
  .total-price {
    color: $primary;
    font-size: 36rpx;
  }
}

// 收货信息
.address-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  font-size: 26rpx;
  color: #666;
  
  .address-icon {
    font-size: 32rpx;
    color: $primary;
    margin-right: 16rpx;
    width: 40rpx;
    text-align: center;
  }
}

// 底部按钮
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 110rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 30rpx;
  gap: 20rpx;
  border-top: 1rpx solid #eee;
  box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.05);
}

.bottom-btn {
  height: 72rpx;
  padding: 0 36rpx;
  border-radius: 36rpx;
  font-size: 28rpx;
  line-height: 72rpx;
  border: none;
  margin: 0;
  
  &::after {
    border: none;
  }
  
  &.line {
    background: #fff;
    border: 2rpx solid #ddd;
    color: #666;
  }
  
  &.primary {
    background: $primary;
    color: #fff;
    
    &[disabled] {
      background: #ccc;
      color: #fff;
    }
  }
}
</style>