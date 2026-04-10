<template>
  <view class="order-list-page">
    <!-- 顶部状态切换 -->
    <view class="order-tab">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === index }"
        v-for="(item, index) in tabList"
        :key="index"
        @click="getOrderList(index)"
      >
        {{ item.name }}
      </view>
    </view>

    <!-- 空订单 -->
    <view class="empty-box" v-if="orderList.length === 0">
      <image class="empty-img" src="/static/img/empty-order.png" mode="widthFix" />
      <text class="empty-text">暂无订单</text>
      <button class="empty-btn" @click="goStore">去点餐</button>
    </view>

    <!-- 订单列表（带商品图片） -->
    <view class="order-card" v-for="(order, index) in orderList" :key="index">
      <!-- 订单头部：订单号 + 状态 -->
      <view class="order-header">
        <view class="order-no">订单号：{{ order.orderNo }}</view>
        <view class="order-status" :class="getStatusClass(order.orderStatus)">
          {{ getStatusText(order.orderStatus) }}
        </view>
      </view>

      <!-- 门店信息 -->
      <view class="store-info">
        <image class="store-logo" :src="order.storeLogo || storeLogo" mode="aspectFill" />
        <text class="store-name">{{ order.storeName || 'https://picsum.photos/100/100?random=10' }}</text>
      </view>

      <!-- 商品列表（新增商品图片） -->
      <view class="goods-list">
        <view class="goods-item" v-for="(item, i) in order.goods" :key="i">
          <!-- 新增：商品图片 -->
          <image 
            class="goods-img" 
            :src="item.img || defaultGoodsImg" 
            mode="aspectFill"
          />
          <view class="goods-info">
            <view class="goods-name">{{ item.productName }}</view>
            <!-- 新增：规格显示 -->
            <view class="goods-spec" v-if="item.specName">{{ item.specName }}</view>
          </view>
          <view class="goods-count">x{{ item.count }}</view>
          <view class="goods-price">¥{{ item.price }}</view>
        </view>
        <!-- 多商品折叠提示（超过2个商品显示） -->
        <view class="more-goods" v-if="order.goods.length > 2">
          <text>+{{ order.goods.length - 2 }} 件商品</text>
        </view>
      </view>

      <!-- 底部合计 + 操作按钮 -->
      <view class="order-footer">
        <view class="total-info">
          <text>共{{ order.goods.length }}件</text>
          <text class="total-price">实付：¥{{ order.finalTotal }}</text>
        </view>
        <view class="btn-group">
          <button 
            class="order-btn line" 
            v-if="order.orderStatus === 0"
            @click="cancelOrder(order.id, index)"
          >
            取消订单
          </button>
          <button 
            class="order-btn primary" 
            v-if="order.orderStatus === 0"
            @click="toPay(order)"
          >
            去支付
          </button>
          <button 
            class="order-btn line" 
            v-if="order.orderStatus === 1"
            @click="toDetail(order.id)"
          >
            查看物流
          </button>
          <button 
            class="order-btn primary" 
            v-if="order.orderStatus === 2"
            @click="toDetail(order.id)"
          >
            查看详情
          </button>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
      data() {
        return {
          activeTab: 0, // 默认0=全部
          tabList: [
            { name: '全部', status: -1 },
            { name: '待付款', status: 0 },
            { name: '待配送', status: 1 },
            { name: '已完成', status: 3 }
          ],
          orderList: [],
          storeLogo: '/static/img/store-default.png',
          defaultGoodsImg: '/static/img/goods-default.png'
        }
      },
	  onShow() {
	    this.getOrderList(0)
	  },
	  methods: {
	    async getOrderList(index) {
      this.activeTab = index
      const status = this.tabList[index].status
      
      try {
        const res = await this.$request.post(this.$apis.order.list, { status })
        let orderList = res.result || []
        
        // 处理图片URL
        orderList = orderList.map(order => {
          // 处理门店logo
              if (order.storeLogo) {
                order.storeLogo = this.$utils.processImageUrl(order.storeLogo)
              }
              
              // 处理商品图片
              if (order.goods && order.goods.length > 0) {
                order.goods = order.goods.map(goods => {
                  if (goods.img) {
                    goods.img = this.$utils.processImageUrl(goods.img)
                  }
                  return goods
                })
              }
          
          return order
        })
        
        this.orderList = orderList
      } catch (e) {
        console.log(e)
      }
    },
	
	    // 状态文字
	    getStatusText(status) {
	      const map = { 
	        0: '待付款', 
	        1: '待配送', 
	        2: '配送中',
	        3: '已完成', 
	        4: '已取消' 
	      }
	      return map[status] || '未知'
	    },
	
	    // 状态颜色
	    getStatusClass(status) {
	      const map = {
	        0: 'wait-pay',
	        1: 'wait-send',
	        2: 'shipping',
	        3: 'finish',
	        4: 'cancel'
	      }
	      return map[status] || ''
	    },
	
	    // 取消订单
	    cancelOrder(id, index) {
	      uni.showModal({
	        title: '提示',
	        content: '确定取消该订单吗？',
	        success: async (res) => {
	          if (res.confirm) {
	            const { data } = await this.$request.post('/order/cancel', { id })
	            if (data.success) {
	              this.orderList.splice(index, 1)
	              uni.showToast({ title: '已取消' })
	            }
	          }
	        }
	      })
	    },
	
	    // 去支付
	    toPay(order) {
	      uni.navigateTo({
	        url: `/pages/order/pay?id=${order.id}&orderNo=${order.orderNo}&total=${order.finalTotal}`
	      })
	    },
	
	    // 去订单详情
	    toDetail(orderId) {
	      uni.navigateTo({
	        url: `/pages/order/detail?id=${orderId}`
	      })
	    },
	
	    // 去点餐
	    goStore() {
	      uni.switchTab({ url: '/pages/home/home' })
	    }
	  }
	}
</script>

<style lang="scss" scoped>
$primary: #ff6b35;
.order-list-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20rpx;

  // 顶部tab
  .order-tab {
    display: flex;
    background: #fff;
    padding: 20rpx 0;
    margin-bottom: 20rpx;

    .tab-item {
      flex: 1;
      text-align: center;
      font-size: 28rpx;
      color: #666;
      padding: 16rpx 0;
      position: relative;

      &.active {
        color: #333;
        font-weight: bold;

        &::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40rpx;
          height: 6rpx;
          background: $primary;
          border-radius: 3rpx;
        }
      }
    }
  }

  // 空订单
  .empty-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 150rpx;

    .empty-img {
      width: 280rpx;
      margin-bottom: 30rpx;
    }

    .empty-text {
      font-size: 28rpx;
      color: #999;
      margin-bottom: 40rpx;
    }

    .empty-btn {
      width: 240rpx;
      height: 70rpx;
      background: $primary;
      color: #fff;
      font-size: 28rpx;
      border-radius: 35rpx;
      border: none;
    }
  }

  // 订单卡片
  .order-card {
    background: #fff;
    border-radius: 16rpx;
    margin: 0 20rpx 20rpx;
    padding: 30rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

    // 头部
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;

      .order-no {
        font-size: 26rpx;
        color: #666;
      }

      .order-status {
        font-size: 26rpx;
        font-weight: bold;

        &.wait-pay { color: $primary; }
        &.wait-send { color: #09f; }
        &.finish { color: #07c160; }
        &.cancel { color: #999; }
      }
    }

    // 门店
    .store-info {
      display: flex;
      align-items: center;
      margin-bottom: 24rpx;

      .store-logo {
        width: 48rpx;
        height: 48rpx;
        border-radius: 8rpx;
        margin-right: 16rpx;
      }

      .store-name {
        font-size: 28rpx;
        color: #333;
        font-weight: bold;
      }
    }

    // 商品列表（新增图片样式）
    .goods-list {
      border-top: 1rpx dashed #eee;
      padding-top: 20rpx;
      margin-bottom: 24rpx;

      // 单个商品（含图片）
      .goods-item {
        display: flex;
        align-items: center;
        padding: 12rpx 0;
        font-size: 26rpx;

        // 商品图片
        .goods-img {
          width: 80rpx;
          height: 80rpx;
          border-radius: 8rpx;
          margin-right: 20rpx;
          flex-shrink: 0; // 防止图片被压缩
        }

        // 商品名称+规格
        .goods-info {
          flex: 1;
          overflow: hidden; // 防止文字溢出
        }

        .goods-name {
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis; // 文字溢出显示省略号
        }

        // 规格样式
        .goods-spec {
          font-size: 22rpx;
          color: #999;
          margin-top: 4rpx;
        }

        .goods-count {
          color: #999;
          margin: 0 20rpx;
          min-width: 60rpx;
          text-align: center;
        }

        .goods-price {
          color: #333;
          font-weight: bold;
          min-width: 100rpx;
          text-align: right;
        }
      }

      // 多商品折叠提示
      .more-goods {
        padding: 10rpx 0 0 100rpx; // 对齐商品名称
        font-size: 24rpx;
        color: #999;
      }
    }

    // 底部
    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 20rpx;
      border-top: 1rpx solid #f0f0f0;

      .total-info {
        display: flex;
        flex-direction: column;
        font-size: 24rpx;
        color: #999;

        .total-price {
          color: $primary;
          font-size: 30rpx;
          font-weight: bold;
          margin-top: 6rpx;
        }
      }

      .btn-group {
        display: flex;
        gap: 16rpx;

        .order-btn {
          height: 60rpx;
          padding: 0 24rpx;
          font-size: 24rpx;
          border-radius: 30rpx;
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
      }
    }
  }
}
</style>