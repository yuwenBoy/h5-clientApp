<template>
  <view class="order-list-page">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-back" @click="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <text class="nav-title">订单列表</text>
      <view class="nav-right"></view>
    </view>
    
    <!-- 顶部状态切换 -->
    <view class="order-tab">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === index }"
        v-for="(item, index) in tabList"
        :key="index"
        @click="switchTab(index)"
      >
        {{ item.name }}
        <view class="badge" v-if="item.badge > 0">{{ item.badge }}</view>
      </view>
    </view>

    <!-- 空订单 -->
    <view class="empty-box" v-if="orderList.length === 0 && !loading">
      <image class="empty-img" src="/static/img/empty-order.png" mode="widthFix" />
      <text class="empty-text">暂无订单</text>
      <button class="empty-btn" @click="goStore">去点餐</button>
    </view>

    <!-- 订单列表 -->
    <scroll-view 
      scroll-y 
      class="order-scroll" 
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="order-card" v-for="(order, index) in orderList" :key="order.id" @click="toDetail(order.id)">
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
          <text class="store-name">{{ order.storeName || '商家店铺' }}</text>
          <text class="el-icon-arrow-right"></text>
        </view>

        <!-- 商品列表 -->
        <view class="goods-list">
          <view class="goods-item" v-for="(item, i) in order.items || []" :key="i">
            <image 
              class="goods-img" 
              :src="item.goodsImg || item.img || defaultGoodsImg" 
              mode="aspectFill"
            />
            <view class="goods-info">
              <view class="goods-name">{{ item.goodsName || item.productName }}</view>
              <view class="goods-spec" v-if="item.specName">{{ item.specName }}</view>
            </view>
            <view class="goods-count">x{{ item.quantity || item.count || 1 }}</view>
            <view class="goods-price">¥{{ item.unitPrice || item.price || 0 }}</view>
          </view>
          <!-- 多商品折叠提示（超过2个商品显示） -->
          <view class="more-goods" v-if="(order.items || []).length > 2">
            <text>+{{ (order.items || []).length - 2 }} 件商品</text>
          </view>
        </view>

        <!-- 底部合计 + 操作按钮 -->
        <view class="order-footer">
          <view class="total-info">
            <text>共{{ (order.items || []).length }}件商品</text>
            <text class="total-label">实付：</text>
            <text class="total-price">¥{{ order.finalTotal }}</text>
          </view>
          <view class="btn-group">
            <!-- 待支付 -->
            <template v-if="order.orderStatus === 0">
              <button class="order-btn line" @click.stop="cancelOrder(order, index)">
                取消订单
              </button>
              <button class="order-btn primary" @click.stop="toPay(order)">
                去支付
              </button>
            </template>
            <!-- 待接单 -->
            <template v-else-if="order.orderStatus === 1">
              <button class="order-btn line" @click.stop="toDetail(order.id)">
                查看详情
              </button>
              <button class="order-btn primary" @click.stop="contactMerchant(order)">
                联系商家
              </button>
            </template>
            <!-- 备货中 -->
            <template v-else-if="order.orderStatus === 2">
              <button class="order-btn line" @click.stop="toDetail(order.id)">
                查看详情
              </button>
              <button class="order-btn primary" @click.stop="contactMerchant(order)">
                催单
              </button>
            </template>
            <!-- 待配送 -->
            <template v-else-if="order.orderStatus === 3">
              <button class="order-btn line" @click.stop="toDetail(order.id)">
                查看详情
              </button>
              <button class="order-btn primary" @click.stop="viewDelivery(order)">
                配送信息
              </button>
            </template>
            <!-- 配送中 -->
            <template v-else-if="order.orderStatus === 4">
              <button class="order-btn line" @click.stop="contactRider(order)">
                联系骑手
              </button>
              <button class="order-btn primary" @click.stop="confirmReceipt(order, index)">
                确认收货
              </button>
            </template>
            <!-- 已完成 -->
            <template v-else-if="order.orderStatus === 5">
              <button class="order-btn line" @click.stop="toDetail(order.id)">
                查看详情
              </button>
              <button class="order-btn primary" v-if="!order.isReviewed" @click.stop="goReview(order)">
                去评价
              </button>
            </template>
            <!-- 已取消 -->
            <template v-else-if="order.orderStatus === 6 || order.orderStatus === 7">
              <button class="order-btn line" @click.stop="deleteOrder(order, index)">
                删除订单
              </button>
              <button class="order-btn primary" @click.stop="buyAgain(order)">
                再来一单
              </button>
            </template>
          </view>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view class="load-more" v-if="orderList.length > 0">
        <text v-if="loading">加载中...</text>
        <text v-else-if="noMore">没有更多订单了</text>
        <text v-else>上拉加载更多</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
// 订单状态枚举
const OrderStatus = {
  UNPAID: 0,           // 待支付
  PENDING_ACCEPT: 1,   // 待接单
  ACCEPTED_PREPARE: 2, // 备货中
  DAIPEISONG: 3,       // 待配送
  PEISONGZHONG: 4,     // 配送中
  YIWANCHENG: 5,       // 已完成
  CANCELED_MANUAL: 6,  // 已取消（人工）
  CANCELED_TIMEOUT: 7, // 已取消（超时）
  REFUND_ALL_PART: 8   // 已退款
}

// 状态文本映射
const OrderStatusText = {
  [OrderStatus.UNPAID]: '待支付',
  [OrderStatus.PENDING_ACCEPT]: '待接单',
  [OrderStatus.ACCEPTED_PREPARE]: '备货中',
  [OrderStatus.DAIPEISONG]: '待配送',
  [OrderStatus.PEISONGZHONG]: '配送中',
  [OrderStatus.YIWANCHENG]: '已完成',
  [OrderStatus.CANCELED_MANUAL]: '已取消',
  [OrderStatus.CANCELED_TIMEOUT]: '已超时',
  [OrderStatus.REFUND_ALL_PART]: '已退款'
}

export default {
  data() {
    return {
      activeTab: 0,
      tabList: [
        { name: '全部', status: null, badge: 0 },
        { name: '待支付', status: 0, badge: 0 },
        { name: '进行中', status: 'processing', badge: 0 },
        { name: '已完成', status: 5, badge: 0 }
      ],
      orderList: [],
      storeLogo: '/static/img/store-default.png',
      defaultGoodsImg: '/static/img/goods-default.png',
      loading: false,
      refreshing: false,
      page: 1,
      pageSize: 10,
      noMore: false,
      navigating: false // 防止重复跳转
    }
  },
  
  onLoad() {
    this.refreshList()
  },
  
  onShow() {
    // 只在有数据时刷新，避免首次加载重复
    if (this.orderList.length > 0) {
      this.refreshList()
    }
  },
  
  methods: {
    // 返回上一页
    goBack() {
      if (this.navigating) return
      this.navigating = true
      
      // 直接返回，不做复杂判断
      uni.navigateBack({
        fail: () => {
          // 如果没有上一页，回到首页
          uni.switchTab({ url: '/pages/home/home' })
        },
        complete: () => {
          setTimeout(() => {
            this.navigating = false
          }, 300)
        }
      })
    },
    
    // 切换标签
    switchTab(index) {
      if (this.activeTab === index) return
      this.activeTab = index
      this.refreshList()
    },
    
    // 刷新列表
    refreshList() {
      this.page = 1
      this.noMore = false
      this.getOrderList()
    },
    
    // 下拉刷新
    onRefresh() {
      this.refreshing = true
      this.refreshList()
    },
    
    // 加载更多
    loadMore() {
      if (this.loading || this.noMore) return
      this.page++
      this.getOrderList(true)
    },
    
    // 获取订单列表
    async getOrderList(isLoadMore = false) {
      if (this.loading) return
      this.loading = true
      
      try {
        const tabItem = this.tabList[this.activeTab]
        let status = tabItem.status
        
        // 处理"进行中"特殊状态（包含待接单、备货中、待配送、配送中）
        if (status === 'processing') {
          status = null  // 后端需要特殊处理，暂时获取全部
        }
        
        const params = {
          page: this.page,
          pageSize: this.pageSize
        }
        
        if (status !== null) {
          params.status = status
        }
        
        const res = await this.$request.post(this.$apis.order.list, params)
        
        // 调试：打印接口返回数据
        console.log('订单列表接口返回:', res)
        
        // 兼容多种返回格式
        const isSuccess = res.code === 0 || res.code === 200 || res.success === true
        if (isSuccess) {
          // 兼容多种数据结构：res.result.list / res.data.list / res.list / res.result / res.data
          let list = []
          if (res.result && Array.isArray(res.result.list)) {
            list = res.result.list
          } else if (res.result && Array.isArray(res.result)) {
            list = res.result
          } else if (res.data && Array.isArray(res.data.list)) {
            list = res.data.list
          } else if (res.data && Array.isArray(res.data)) {
            list = res.data
          } else if (Array.isArray(res.list)) {
            list = res.list
          } else if (Array.isArray(res)) {
            list = res
          }
          
          console.log('解析后的订单列表:', list)
          
          // 如果是"进行中"标签，前端过滤
          if (tabItem.status === 'processing') {
            list = list.filter(order => {
              return [1, 2, 3, 4].includes(order.orderStatus)
            })
          }
          
          // 处理图片URL
          list = list.map(order => {
            if (order.storeLogo) {
              order.storeLogo = this.$utils.processImageUrl(order.storeLogo)
            }
            if (order.items && order.items.length > 0) {
              order.items = order.items.map(item => {
                // 优先使用 goodsImg，如果为null则使用 img，都为空则使用默认图片
                const imgUrl = item.goodsImg || item.img
                if (imgUrl) {
                  item.goodsImg = this.$utils.processImageUrl(imgUrl)
                } else {
                  item.goodsImg = this.defaultGoodsImg
                }
                return item
              })
            }
            return order
          })
          
          if (isLoadMore) {
            this.orderList = [...this.orderList, ...list]
          } else {
            this.orderList = list
          }
          
          // 判断是否还有更多（兼容多种分页数据结构）
          let total = 0
          if (res.result && res.result.pagination && res.result.pagination.total !== undefined) {
            total = res.result.pagination.total
          } else if (res.result && res.result.total !== undefined) {
            total = res.result.total
          } else if (res.data && res.data.pagination && res.data.pagination.total !== undefined) {
            total = res.data.pagination.total
          } else if (res.data && res.data.total !== undefined) {
            total = res.data.total
          } else if (res.total !== undefined) {
            total = res.total
          }
          this.noMore = this.orderList.length >= total || list.length < this.pageSize
        } else {
          uni.showToast({ title: res.message || '获取订单失败', icon: 'none' })
        }
      } catch (e) {
        console.error('获取订单列表失败:', e)
        uni.showToast({ title: '获取订单失败', icon: 'none' })
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },
    
    // 状态文字
    getStatusText(status) {
      return OrderStatusText[status] || '未知状态'
    },
    
    // 状态颜色
    getStatusClass(status) {
      const map = {
        [OrderStatus.UNPAID]: 'wait-pay',
        [OrderStatus.PENDING_ACCEPT]: 'wait-accept',
        [OrderStatus.ACCEPTED_PREPARE]: 'preparing',
        [OrderStatus.DAIPEISONG]: 'wait-delivery',
        [OrderStatus.PEISONGZHONG]: 'delivering',
        [OrderStatus.YIWANCHENG]: 'finished',
        [OrderStatus.CANCELED_MANUAL]: 'canceled',
        [OrderStatus.CANCELED_TIMEOUT]: 'canceled',
        [OrderStatus.REFUND_ALL_PART]: 'refunded'
      }
      return map[status] || ''
    },
    
    // 取消订单
    cancelOrder(order, index) {
      uni.showModal({
        title: '提示',
        content: '确定取消该订单吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await this.$request.post(this.$apis.order.cancel, { 
                orderId: order.id 
              })
              if (result.code === 0 || result.success) {
                uni.showToast({ title: '已取消', icon: 'success' })
                // 更新订单状态
                this.orderList[index].orderStatus = OrderStatus.CANCELED_MANUAL
              } else {
                uni.showToast({ title: result.message || '取消失败', icon: 'none' })
              }
            } catch (e) {
              uni.showToast({ title: '取消失败', icon: 'none' })
            }
          }
        }
      })
    },
    
    // 删除订单
    deleteOrder(order, index) {
      uni.showModal({
        title: '提示',
        content: '确定删除该订单吗？删除后将无法恢复',
        success: async (res) => {
          if (res.confirm) {
            // 调用删除接口（如有）
            this.orderList.splice(index, 1)
            uni.showToast({ title: '已删除' })
          }
        }
      })
    },
    
    // 确认收货
    confirmReceipt(order, index) {
      uni.showModal({
        title: '确认收货',
        content: '确认已收到商品吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await this.$request.post('/order/confirm-receipt', { 
                orderId: order.id 
              })
              if (result.code === 0 || result.success) {
                uni.showToast({ title: '确认成功', icon: 'success' })
                this.orderList[index].orderStatus = OrderStatus.YIWANCHENG
              } else {
                uni.showToast({ title: result.message || '操作失败', icon: 'none' })
              }
            } catch (e) {
              uni.showToast({ title: '操作失败', icon: 'none' })
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
    
    // 联系商家
    contactMerchant(order) {
      uni.makePhoneCall({
        phoneNumber: order.storePhone || ''
      })
    },
    
    // 联系骑手
    contactRider(order) {
      if (order.riderPhone) {
        uni.makePhoneCall({
          phoneNumber: order.riderPhone
        })
      } else {
        uni.showToast({ title: '暂无骑手联系方式', icon: 'none' })
      }
    },
    
    // 查看配送信息
    viewDelivery(order) {
      uni.navigateTo({
        url: `/pages/order/detail?id=${order.id}&tab=delivery`
      })
    },
    
    // 去评价
    goReview(order) {
      uni.navigateTo({
        url: `/pages/order/review?id=${order.id}`
      })
    },
    
    // 再来一单
    buyAgain(order) {
      // 跳转到商家页面
      uni.switchTab({
        url: '/pages/home/home'
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
  display: flex;
  flex-direction: column;
  padding-top: calc(var(--status-bar-height) + 88rpx);
}

// 自定义导航栏
.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: calc(var(--status-bar-height) + 88rpx);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--status-bar-height) 30rpx 0;
  z-index: 999;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  
  .nav-back {
    width: 88rpx;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .back-arrow {
      font-size: 48rpx;
      color: #333;
      font-weight: bold;
      line-height: 1;
    }
    
    &:active {
      opacity: 0.6;
    }
  }
  
  .nav-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
  }
  
  .nav-right {
    width: 60rpx;
  }
}

// 顶部tab
.order-tab {
  display: flex;
  background: #fff;
  padding: 20rpx 0;
  position: sticky;
  top: 0;
  z-index: 100;

  .tab-item {
    flex: 1;
    text-align: center;
    font-size: 28rpx;
    color: #666;
    padding: 16rpx 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

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
    
    .badge {
      background: #ff4d4f;
      color: #fff;
      font-size: 20rpx;
      min-width: 32rpx;
      height: 32rpx;
      line-height: 32rpx;
      text-align: center;
      border-radius: 16rpx;
      margin-left: 8rpx;
      padding: 0 8rpx;
    }
  }
}

// 滚动区域
.order-scroll {
  flex: 1;
  height: calc(100vh - 100rpx);
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

      &.wait-pay { color: #ff4d4f; }
      &.wait-accept { color: #ff6b35; }
      &.preparing { color: #faad14; }
      &.wait-delivery { color: #1890ff; }
      &.delivering { color: #52c41a; }
      &.finished { color: #52c41a; }
      &.canceled { color: #999; }
      &.refunded { color: #999; }
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
      flex: 1;
    }
  }

  // 商品列表
  .goods-list {
    border-top: 1rpx dashed #eee;
    padding-top: 20rpx;
    margin-bottom: 24rpx;

    .goods-item {
      display: flex;
      align-items: center;
      padding: 12rpx 0;
      font-size: 26rpx;

      .goods-img {
        width: 80rpx;
        height: 80rpx;
        border-radius: 8rpx;
        margin-right: 20rpx;
        flex-shrink: 0;
      }

      .goods-info {
        flex: 1;
        overflow: hidden;
      }

      .goods-name {
        color: #333;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

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

    .more-goods {
      padding: 10rpx 0 0 100rpx;
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
      align-items: baseline;
      font-size: 24rpx;
      color: #999;

      .total-label {
        margin-left: 16rpx;
        color: #333;
      }

      .total-price {
        color: $primary;
        font-size: 32rpx;
        font-weight: bold;
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
        line-height: 60rpx;

        &.line {
          background: #fff;
          border: 2rpx solid #ccc;
          color: #666;
        }

        &.primary {
          background: $primary;
          color: #fff;
        }
        
        &::after {
          border: none;
        }
      }
    }
  }
}

// 加载更多
.load-more {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
}
</style>
