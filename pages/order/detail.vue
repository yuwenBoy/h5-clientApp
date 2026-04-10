<template>
  <view class="order-detail">
    <!-- 状态头部 -->
    <view class="status-header" :class="getStatusClass(order.orderStatus)">
      <view class="status-text">{{ getStatusText(order.orderStatus) }}</view>
      <view class="status-desc" v-if="order.orderStatus === 0">请尽快完成支付</view>
      <view class="status-desc" v-else-if="order.orderStatus === 1">商家正在准备中</view>
      <view class="status-desc" v-else-if="order.orderStatus === 2">订单已完成</view>
    </view>

    <!-- 订单信息 -->
    <view class="info-card">
      <view class="info-item">
        <text>订单编号</text>
        <text>{{ order.orderNo }}</text>
      </view>
      <view class="info-item">
        <text>创建时间</text>
        <text>{{ order.createTime }}</text>
      </view>
      <view class="info-item">
        <text>支付方式</text>
        <text>{{ order.payMethod === 'wechat' ? '微信支付' : '支付宝' }}</text>
      </view>
      <view class="info-item">
        <text>配送时间</text>
        <text>{{ order.deliveryTime }}</text>
      </view>
    </view>

    <!-- 门店信息 -->
    <view class="store-card">
      <image class="store-logo" :src="storeLogo" />
      <view class="store-text">
        <view class="store-name">{{ order.storeName }}</view>
        <view class="store-desc">商家配送 | 预计30分钟送达</view>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="goods-card">
      <view class="card-title">商品信息</view>
      <view class="goods-item" v-for="(item, i) in order.goods" :key="i">
        <view class="goods-name">{{ item.productName }}</view>
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
        <text>¥{{ order.deliveryFee }}</text>
      </view>
      <view class="price-item" v-if="order.discount > 0">
        <text>优惠减免</text>
        <text>-¥{{ order.discount }}</text>
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
        <text>收货人：{{ order.addressName }}</text>
      </view>
      <view class="address-item">
        <text>联系电话：{{ order.addressPhone }}</text>
      </view>
      <view class="address-item">
        <text>收货地址：{{ order.addressDetail }}</text>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <button
        class="bottom-btn line"
        v-if="order.orderStatus === 0"
        @click="cancelOrder"
      >
        取消订单
      </button>
      <button
        class="bottom-btn primary"
        v-if="order.orderStatus === 0"
        @click="toPay"
      >
        立即支付
      </button>
      <button
        class="bottom-btn primary"
        v-if="order.orderStatus === 1"
        disabled
      >
        配送中
      </button>
      <button
        class="bottom-btn primary"
        v-if="order.orderStatus === 2"
        @click="backHome"
      >
        回到首页
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderId: null,
      storeLogo: '/static/logo.png',
      order: {
        orderNo: '20260324123456789',
        orderStatus: 0,
        createTime: '2026-03-24 12:30:45',
        payMethod: 'wechat',
        deliveryTime: '尽快送达',
        storeName: '盖东来大块牛肉饭',
        goodsTotal: '105.40',
        deliveryFee: '5.00',
        discount: '0.00',
        finalTotal: '105.40',
        addressName: '张三',
        addressPhone: '138****8888',
        addressDetail: '北京市朝阳区建国路88号SOHO现代城A座1201室',
        goods: [
          { productName: '干锅土豆片盖饭', price: '28.80', count: 1 },
          { productName: '红烧牛肉盖饭', price: '38.80', count: 2 }
        ]
      }
    }
  },
  onLoad(options) {
    this.orderId = options.id
    this.getOrderDetail()
  },
  methods: {
    async getOrderDetail() {
      // 真实接口：
      // const res = await this.$request.get('/order/detail', { id: this.orderId })
      // const order = res.result
      // 
      // // 处理图片URL
      // if (order.storeLogo) {
      //   order.storeLogo = this.$utils.processImageUrl(order.storeLogo)
      // }
      // 
      // if (order.goods && order.goods.length > 0) {
      //   order.goods = order.goods.map(goods => {
      //     if (goods.img) {
      //       goods.img = this.$utils.processImageUrl(goods.img)
      //     }
      //     return goods
      //   })
      // }
      // 
      // this.order = order
    },
    getStatusText(status) {
      const map = { 0: '待付款', 1: '待配送', 2: '已完成' }
      return map[status]
    },
    getStatusClass(status) {
      const map = { 0: 'wait', 1: 'ing', 2: 'finish' }
      return map[status]
    },
    cancelOrder() {
      uni.showModal({
        title: '确认取消',
        content: '确定取消该订单吗？',
        success: () => {
          uni.showToast({ title: '取消成功' })
          setTimeout(() => uni.navigateBack(), 1500)
        }
      })
    },
    toPay() {
      uni.navigateTo({
        url: `/pages/order/pay?orderId=${this.orderId}&total=${this.order.finalTotal}`
      })
    },
    backHome() {
      uni.switchTab({ url: '/pages/index/index' })
    }
  }
}
</script>

<style lang="scss" scoped>
$primary: #ff6b35;
.order-detail {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 120rpx;
}
.status-header {
  padding: 40rpx 30rpx;
  text-align: center;
  color: #fff;
  &.wait { background: #ff6b35; }
  &.ing { background: #09f; }
  &.finish { background: #07c160; }
  .status-text {
    font-size: 40rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
  }
  .status-desc {
    font-size: 26rpx;
    opacity: 0.9;
  }
}
.info-card, .store-card, .goods-card, .price-card, .address-card {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
}
.info-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  font-size: 26rpx;
  color: #666;
  &:not(:last-child) {
    border-bottom: 1rpx solid #f0f0f0;
  }
}
.store-card {
  display: flex;
  align-items: center;
  .store-logo {
    width: 60rpx;
    height: 60rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
  }
  .store-name {
    font-size: 30rpx;
    font-weight: bold;
    margin-bottom: 6rpx;
  }
  .store-desc {
    font-size: 24rpx;
    color: #999;
  }
}
.card-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}
.goods-item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  font-size: 26rpx;
  .goods-name { flex: 1; }
  .goods-count { color: #999; margin: 0 20rpx; }
  .goods-price { font-weight: bold; }
}
.price-item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  font-size: 26rpx;
}
.price-total {
  display: flex;
  justify-content: space-between;
  padding-top: 20rpx;
  margin-top: 20rpx;
  border-top: 1rpx dashed #eee;
  font-size: 28rpx;
  font-weight: bold;
  .total-price {
    color: $primary;
    font-size: 32rpx;
  }
}
.address-item {
  padding: 12rpx 0;
  font-size: 26rpx;
  color: #666;
}
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20rpx;
  gap: 20rpx;
  border-top: 1rpx solid #eee;
}
.bottom-btn {
  height: 70rpx;
  padding: 0 30rpx;
  border-radius: 35rpx;
  font-size: 28rpx;
  border: none;
  &.line {
    background: #fff;
    border: 2rpx solid #ccc;
    color: #666;
  }
  &.primary {
    background: $primary;
    color: #fff;
  }
}
</style>