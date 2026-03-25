<template>
  <view class="pay-page">
    <view class="pay-card">
      <view class="pay-title">订单支付</view>
      <view class="price">¥{{ total }}</view>
      <view class="order-no">订单号：{{ orderNo }}</view>
    </view>

    <view class="pay-list">
      <view class="pay-item" @click="pay('wechat')" v-if="platform === 'mp-weixin'">
        <image class="icon" src="/static/wechat.png" mode="widthFix"></image>
        <text>微信支付</text>
        <view class="check"></view>
      </view>

      <view class="pay-item" @click="pay('alipay')" v-if="platform === 'mp-alipay'">
        <image class="icon" src="/static/alipay.png" mode="widthFix"></image>
        <text>支付宝支付</text>
        <view class="check"></view>
      </view>
    </view>

    <button class="pay-btn" @click="nativePay">立即支付</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderId: null,
      orderNo: "",
      total: "0.00",
      payType: "wechat",
      platform: "mp-weixin", // 支付宝会自动是 mp-alipay
    };
  },
  onLoad(options) {
		debugger
    this.orderId = options.id;
    this.orderNo = options.orderNo;
    this.total = options.total;
    this.platform = uni.getSystemInfoSync().uniPlatform;
  },
  methods: {
    async nativePay() {
      const res = await this.$request.post(this.$apis.pay.unified, {
        orderId: this.orderId,
        payType: this.payType,
      });

      // const params = res.data.payParams;

      if (this.payType === "wechat") {
				uni.showToast({ title: "支付成功" });
				setTimeout(() => uni.redirectTo({ url: "/pages/order/list" }), 1500);
        // // 微信支付
        // uni.requestPayment({
        //   provider: "wxpay",
        //   timeStamp: params.timeStamp,
        //   nonceStr: params.nonceStr,
        //   package: params.package,
        //   signType: params.signType,
        //   paySign: params.paySign,
        //   success: () => {
        //     uni.showToast({ title: "支付成功" });
        //     setTimeout(() => uni.redirectTo({ url: "/pages/order/list" }), 1500);
        //   },
        // });
      } else {
        // 支付宝支付
        uni.requestPayment({
          provider: "alipay",
          orderInfo: params.orderStr,
          success: () => {
            uni.showToast({ title: "支付成功" });
            setTimeout(() => uni.redirectTo({ url: "/pages/order/list" }), 1500);
          },
        });
      }
    },
  },
};
</script>

<style scoped lang="scss">
$primary: #ff6b35;
.pay-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 30rpx;
}
.pay-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 50rpx 40rpx;
  text-align: center;
  margin-bottom: 30rpx;
}
.price {
  font-size: 60rpx;
  font-weight: bold;
  color: $primary;
  margin: 20rpx 0;
}
.pay-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}
.pay-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  .icon {
    width: 48rpx;
    height: 48rpx;
    margin-right: 20rpx;
  }
}
.pay-btn {
  margin-top: 40rpx;
  height: 88rpx;
  background: $primary;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
}
</style>