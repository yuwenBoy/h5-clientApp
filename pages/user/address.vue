<template>
  <view class="address-page">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-back" @click="goBack">
        <text class="back-arrow">‹</text>
      </view>
      <text class="nav-title">收货地址</text>
      <view class="nav-right">
        <text class="nav-action manage" @click="toggleManage">管理</text>
        <text class="nav-action add" @click="addAddress">新增地址</text>
      </view>
    </view>

    <!-- 地址列表 -->
    <scroll-view 
      scroll-y 
      class="address-list"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="address-item" v-for="(item, index) in addressList" :key="index" @click="selectAddress(item)">
        <!-- 地址（第一行） -->
        <view class="address-main">
          <text class="address-text">{{ item.province }}{{ item.city }}{{ item.district }}{{ item.detailAddress }}</text>
          <view class="default-tag" v-if="item.isDefault">家</view>
        </view>
        <!-- 姓名+电话（第二行） -->
        <view class="address-footer">
          <view class="user-info">
            <text class="user-name">{{ item.name }}</text>
            <text class="user-phone">{{ item.phone }}</text>
          </view>
          <view class="edit-icon" @click.stop="editAddress(item)">
            <text class="edit-text">✎</text>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="addressList.length === 0 && !loading">
        <text class="empty-icon">📍</text>
        <text class="empty-text">暂无收货地址</text>
        <button class="add-btn" @click="addAddress">添加地址</button>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      addressList: [],
      loading: false,
      refreshing: false,
      selectedAddressId: null,
      isManageMode: false
    }
  },

  onLoad(options) {
    this.selectedAddressId = options.selectedId || null
    this.getAddressList()
  },

  onShow() {
    this.getAddressList()
  },

  methods: {
    async getAddressList() {
      this.loading = true
      try {
        const res = await this.$request.post(this.$apis.user.addressList || '/client/user/address/list')
        if (res.success && res.result) {
          this.addressList = res.result
        }
      } catch (error) {
        console.error('获取地址列表失败:', error)
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },

    onRefresh() {
      this.refreshing = true
      this.getAddressList()
    },

    selectAddress(address) {
      if (this.selectedAddressId !== null) {
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        if (prevPage) {
          prevPage.$vm.selectAddress(address)
        }
        uni.navigateBack()
      }
    },

    addAddress() {
      uni.navigateTo({
        url: '/pages/user/addressEdit'
      })
    },

    editAddress(item) {
      uni.navigateTo({
        url: `/pages/user/addressEdit?id=${item.id}`
      })
    },

    toggleManage() {
      this.isManageMode = !this.isManageMode
      if (this.isManageMode) {
        uni.showToast({ title: '已进入管理模式', icon: 'none' })
      }
    },

    deleteAddress(id) {
      uni.showModal({
        title: '删除地址',
        content: '确定要删除该地址吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await this.$request.post(this.$apis.user.addressDelete || '/client/user/address/delete', { id })
              if (result.success) {
                uni.showToast({ title: '删除成功', icon: 'success' })
                this.getAddressList()
              }
            } catch (error) {
              console.error('删除地址失败:', error)
              uni.showToast({ title: '删除失败', icon: 'none' })
            }
          }
        }
      })
    },

    goBack() {
      uni.navigateBack({
        success: () => {},
        fail: () => {
          uni.switchTab({ url: '/pages/user/user' })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.address-page {
  min-height: 100vh;
  background: #f5f5f5;
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

  .nav-back {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .back-arrow {
      font-size: 48rpx;
      color: #000;
      font-weight: 500;
      line-height: 1;
      margin-left: -8rpx;
    }
    
    &:active {
      opacity: 0.6;
    }
  }

  .nav-title {
    font-size: 34rpx;
    font-weight: 500;
    color: #333;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 30rpx;

    .nav-action {
      font-size: 28rpx;
      
      &.manage {
        color: #666;
      }
      
      &.add {
        color: #ff6000;
        font-weight: 500;
      }
    }
  }
}

// 地址列表
.address-list {
  padding: 20rpx;
}

.address-item {
  background: #fff;
  border-radius: 8rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;

  .address-main {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16rpx;

    .address-text {
      flex: 1;
      font-size: 32rpx;
      color: #333;
      line-height: 1.5;
      font-weight: 500;
    }

    .default-tag {
      background: #fff0e8;
      color: #ff6000;
      font-size: 22rpx;
      padding: 4rpx 12rpx;
      border-radius: 4rpx;
      margin-left: 16rpx;
      flex-shrink: 0;
    }
  }

  .address-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .user-info {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .user-name {
        font-size: 26rpx;
        color: #666;
      }

      .user-phone {
        font-size: 26rpx;
        color: #666;
      }
    }

    .edit-icon {
      width: 48rpx;
      height: 48rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f8f8;
      border-radius: 50%;

      .edit-text {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 40rpx;
  }

  .add-btn {
    width: 280rpx;
    height: 80rpx;
    background: #ff6000;
    color: #fff;
    font-size: 28rpx;
    border-radius: 40rpx;
    border: none;
  }
}

.bottom-space {
  height: 100rpx;
}
</style>
