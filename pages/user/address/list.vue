<template>
  <view class="address-page" @click="closeAllSwipe">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click.stop="goBack">
        <uni-icons type="left" size="24" color="#333"></uni-icons>
      </view>
      <text class="nav-title">我的地址</text>
      <view class="nav-right"></view>
    </view>

    <!-- 地址列表 -->
    <scroll-view 
      scroll-y 
      class="address-scroll" 
      :class="{ 'has-list': addressList.length }"
      v-if="addressList.length"
      @click.stop
    >
      <view class="address-list">
        <view 
          class="address-card" 
          v-for="(item, index) in addressList" 
          :key="index"
          :class="{ 'is-default': item.isDefault, 'is-open': item.translateX < -50 }"
        >
          <!-- 操作按钮层 - 在底层 -->
          <view class="slide-actions">
            <view class="slide-btn default" @click="setDefaultAddress(item.id, index)" v-if="!item.isDefault">
              <uni-icons type="checkbox-filled" size="20" color="#fff"></uni-icons>
              <text class="slide-btn-text">默认</text>
            </view>
            <view class="slide-btn edit" @click="goEditAddress(item, index)">
              <uni-icons type="compose" size="20" color="#fff"></uni-icons>
              <text class="slide-btn-text">编辑</text>
            </view>
            <view class="slide-btn delete" @click="deleteAddress(item.id, index)">
              <uni-icons type="trash-filled" size="20" color="#fff"></uni-icons>
              <text class="slide-btn-text">删除</text>
            </view>
          </view>
          
          <!-- 地址内容层 - 在上层，可滑动 -->
          <view 
            class="card-content"
            @touchstart="touchStart($event, index)"
            @touchmove="touchMove($event, index)"
            @touchend="touchEnd($event, index)"
            @click="selectAddress(item)"
            :style="{ transform: `translateX(${item.translateX || 0}px)` }"
          >
            <view class="card-main">
              <view class="user-row">
                <text class="user-name">{{ item.receiver }}</text>
                <text class="user-phone">{{ item.phone }}</text>
                <view class="default-badge" v-if="item.isDefault">默认</view>
              </view>
              
              <view class="address-row">
                <view class="location-icon">
                  <uni-icons type="location-filled" size="16" color="#ff6b35"></uni-icons>
                </view>
                <text class="address-text">{{ item.province }} {{ item.city }} {{ item.area }} {{ item.detailAddress }}</text>
              </view>
            </view>
            
            <view class="drag-hint">
              <uni-icons type="left" size="14" color="#ccc"></uni-icons>
            </view>
          </view>
        </view>
        
        <view class="list-tips">左滑地址卡片可编辑或删除</view>
        <view class="list-bottom"></view>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <view class="empty-illustration">
        <view class="empty-bg">
          <uni-icons type="location" size="80" color="#ddd"></uni-icons>
        </view>
      </view>
      <text class="empty-title">暂无收货地址</text>
      <text class="empty-desc">添加地址后可以快速下单，享受便捷服务</text>
      <view class="empty-btn" @click="goAddAddress">
        <text class="empty-btn-text">添加新地址</text>
      </view>
    </view>

    <!-- 底部添加按钮 -->
    <view class="bottom-bar" v-if="addressList.length">
      <view class="add-btn" @click="goAddAddress">
        <view class="add-icon-wrapper">
          <uni-icons type="plusempty" size="24" color="#fff"></uni-icons>
        </view>
        <text class="add-btn-text">添加新地址</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      addressList: [],
      fromOrder: false,
      movingIndex: -1,
      startX: 0,
      startY: 0,
      moveX: 0,
      slideBtnWidth: 120 // 每个按钮宽度(rpx)
    };
  },
  computed: {
    // 根据是否有默认地址按钮计算总滑动宽度
    slideMaxWidth() {
      // 3个按钮 * 120rpx = 360rpx, 或者 2个按钮 = 240rpx
      return 360;
    }
  },
  onLoad(options) {
    this.fromOrder = options.from === 'order'
    // 检查登录状态
    if (!this.checkLogin()) return
    this.getAddressList();
  },
  onShow() {
    // 只在已登录时刷新列表
    const token = this.$utils.getStorage('token')
    if (token && token !== '{}') {
      this.getAddressList();
    }
  },
  methods: {
    goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack();
      } else {
        // 如果没有上一页，跳转到首页
        uni.switchTab({ url: '/pages/home/home' });
      }
    },

    // 关闭所有滑开的卡片
    closeAllSwipe(e) {
      // 如果点击的是卡片内容区域，不处理（让卡片的click事件处理）
      if (e && e.target && e.target.closest) {
        const cardContent = e.target.closest('.card-content');
        if (cardContent) return;
      }
      
      // 关闭所有卡片
      this.addressList.forEach((item, i) => {
        if (item.translateX < 0) {
          this.$set(this.addressList[i], 'translateX', 0);
        }
      });
    },

    // 触摸开始
    touchStart(e, index) {
      this.movingIndex = index
      this.startX = e.touches[0].clientX
      this.startY = e.touches[0].clientY
      this.moveX = this.addressList[index].translateX || 0
      
      // 关闭其他已滑开的卡片
      this.addressList.forEach((item, i) => {
        if (i !== index) {
          item.translateX = 0
        }
      })
    },

    // rpx 转 px
    rpxToPx(rpx) {
      const windowWidth = uni.getSystemInfoSync().windowWidth
      return rpx * windowWidth / 750
    },

    // 触摸移动
    touchMove(e, index) {
      if (this.movingIndex !== index) return
      
      const currentX = e.touches[0].clientX
      const currentY = e.touches[0].clientY
      const deltaX = currentX - this.startX
      const deltaY = currentY - this.startY
      
      // 判断是左右滑动还是上下滑动
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        // 左右滑动
        let translateX = this.moveX + deltaX
        const maxSlide = this.rpxToPx(this.slideMaxWidth)
        
        // 限制滑动范围
        if (translateX > 0) {
          translateX = 0
        } else if (translateX < -maxSlide) {
          translateX = -maxSlide
        }
        
        this.$set(this.addressList[index], 'translateX', translateX)
      }
    },

    // 触摸结束
    touchEnd(e, index) {
      const item = this.addressList[index]
      const translateX = item.translateX || 0
      const maxSlide = this.rpxToPx(this.slideMaxWidth)
      
      // 根据滑动距离决定是否展开或收起
      if (translateX < -maxSlide / 3) {
        // 展开显示所有按钮
        this.$set(item, 'translateX', -maxSlide)
      } else {
        // 收起
        this.$set(item, 'translateX', 0)
      }
      
      this.movingIndex = -1
    },

    selectAddress(item) {
      // 如果卡片已经滑开，点击时收起
      if (item.translateX && item.translateX < -30) {
        this.$set(item, 'translateX', 0)
        return
      }
      
      // 从订单页进入时才选择地址
      if (this.fromOrder) {
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        if (prevPage && prevPage.$vm) {
          prevPage.$vm.selectedAddress = item
        }
        uni.navigateBack()
      }
    },

    async getAddressList() {
      try {
        const res = await this.$request.post(this.$apis.user.getAddressList);
        this.addressList = (res.result || []).map(item => ({
          ...item,
          translateX: 0
        }));
      } catch (error) {
        this.$utils.toast('获取地址失败');
      }
    },

    goAddAddress() {
      uni.navigateTo({
        url: '/pages/user/address/edit'
      });
    },

    goEditAddress(item, index) {
      // 先收起滑动
      this.$set(this.addressList[index], 'translateX', 0)
      setTimeout(() => {
        uni.navigateTo({
          url: `/pages/user/address/edit?addressId=${item.id}`
        });
      }, 300);
    },

    async setDefaultAddress(addressId, index) {
      // 先收起滑动
      if (index !== undefined) {
        this.$set(this.addressList[index], 'translateX', 0);
      }
      
      uni.showModal({
        title: '设置默认地址',
        content: '确定将该地址设为默认地址吗？',
        confirmColor: '#ff6b35',
        success: async (res) => {
          if (res.confirm) {
            try {
              await this.$request.post(this.$apis.user.setDefaultAddress, { id: addressId });
              this.$utils.toast('已设为默认地址');
              this.getAddressList();
            } catch (error) {
              this.$utils.toast('设置失败');
            }
          }
        }
      });
    },

    async deleteAddress(addressId, index) {
      // 先收起滑动
      if (index !== undefined) {
        this.$set(this.addressList[index], 'translateX', 0);
      }
      
      uni.showModal({
        title: '删除地址',
        content: '确定删除该地址吗？删除后不可恢复',
        confirmColor: '#ff6b35',
        success: async (res) => {
          if (res.confirm) {
            try {
              await this.$request.post(this.$apis.user.deleteAddress, { id: addressId });
              this.$utils.toast('删除成功');
              this.getAddressList();
            } catch (error) {
              this.$utils.toast('删除失败');
            }
          }
        }
      });
    },
    
    // 检查登录状态
    checkLogin() {
      const token = this.$utils.getStorage('token')
      if (!token || token === '{}') {
        uni.navigateTo({
          url: '/pages/user/login?redirect=' + encodeURIComponent('/pages/user/address/list')
        })
        return false
      }
      return true
    }
  }
};
</script>

<style lang="scss" scoped>
.address-page {
  min-height: 100vh;
  background: #f5f6f7;
}

// 导航栏
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(var(--status-bar-height) + 20rpx) 30rpx 20rpx;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;

  .nav-back {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
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

// 地址列表
.address-scroll {
  &.has-list {
    height: calc(100vh - 200rpx - var(--status-bar-height));
  }
}

.address-list {
  padding: 20rpx;

  .address-card {
    position: relative;
    margin-bottom: 20rpx;
    border-radius: 20rpx;
    overflow: hidden;
    background: transparent;

    &.is-default {
      .card-content {
        border: 2rpx solid #ff6b35;
      }
    }
  }

  // 滑动操作按钮 - 固定在右侧，初始被内容层覆盖
  .slide-actions {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: stretch;
    z-index: 1;

    .slide-btn {
      width: 120rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8rpx;

      &.default {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.edit {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.delete {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
        border-top-right-radius: 20rpx;
        border-bottom-right-radius: 20rpx;
      }

      &-text {
        font-size: 22rpx;
        color: #fff;
        font-weight: 500;
      }
    }
  }

  // 卡片内容 - 覆盖在按钮层上方
  .card-content {
    position: relative;
    z-index: 2;
    width: 100%;
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    transition: transform 0.3s ease;

    .card-main {
      flex: 1;
      min-width: 0;
    }

    .user-row {
      display: flex;
      align-items: center;
      gap: 16rpx;
      margin-bottom: 16rpx;

      .user-name {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }

      .user-phone {
        font-size: 28rpx;
        color: #666;
      }

      .default-badge {
        background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
        color: #fff;
        font-size: 20rpx;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
      }
    }

    .address-row {
      display: flex;
      align-items: flex-start;
      gap: 12rpx;

      .location-icon {
        width: 32rpx;
        height: 32rpx;
        background: #fff5f0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 2rpx;
      }

      .address-text {
        flex: 1;
        font-size: 28rpx;
        color: #666;
        line-height: 1.5;
        word-break: break-all;
      }
    }

    .drag-hint {
      margin-left: 20rpx;
      padding: 10rpx;
      flex-shrink: 0;
    }
  }

  .list-tips {
    text-align: center;
    font-size: 24rpx;
    color: #999;
    padding: 20rpx;
  }

  .list-bottom {
    height: 40rpx;
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;

  .empty-illustration {
    margin-bottom: 40rpx;

    .empty-bg {
      width: 200rpx;
      height: 200rpx;
      background: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.08);
    }
  }

  .empty-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 16rpx;
  }

  .empty-desc {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 60rpx;
  }

  .empty-btn {
    width: 400rpx;
    height: 88rpx;
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.3);

    &:active {
      opacity: 0.9;
    }

    .empty-btn-text {
      font-size: 30rpx;
      color: #fff;
      font-weight: 500;
    }
  }
}

// 底部添加按钮
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 40rpx calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);

  .add-btn {
    height: 88rpx;
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.3);

    &:active {
      transform: scale(0.98);
    }

    .add-icon-wrapper {
      width: 40rpx;
      height: 40rpx;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .add-btn-text {
      font-size: 32rpx;
      color: #fff;
      font-weight: 500;
    }
  }
}
</style>
