<template>
  <view class="spec-popup" v-if="visible">
    <view class="mask" @click="close"></view>
    <view class="spec-content">
      <view class="spec-header">
        <image class="good-img" :src="goods.img || goods.image" mode="aspectFill" />
        <view class="good-info">
          <view class="good-name">{{ goods.name }}</view>
          <view class="good-price">¥{{ currentPrice }}</view>
          <view class="selected-info-header" v-if="selectedSpecText">
            <text class="selected-label">已选：</text>
            <text class="selected-text">{{ selectedSpecText }}</text>
          </view>
        </view>
        <view class="close-btn" @click="close">×</view>
      </view>

      <scroll-view class="spec-body" scroll-y>
        <view class="attr-group" v-for="(group, gIndex) in specGroups" :key="gIndex">
          <view class="attr-title">{{ group.attrName || group.name }}</view>
          <view class="option-list">
            <view
              class="option-item"
              :class="{ active: selected[getAttrId(group)] === getOptionId(opt) }"
              v-for="(opt, oIndex) in (group.options || group.items)"
              :key="oIndex"
              @click="selectOption(getAttrId(group), getOptionId(opt))"
            >
              {{ getOptionName(opt) }}
            </view>
          </view>
        </view>
      </scroll-view>

      <view class="spec-footer">
        <button class="confirm-btn" @click="confirm">
          加入购物车 ¥{{ currentPrice }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'StoreSpecPopup',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    goods: {
      type: Object,
      default: () => ({})
    },
    specGroups: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selected: {},
      currentPrice: 0
    }
  },
  computed: {
    selectedSpecText() {
      if (!this.specGroups.length) return ''
      const texts = []
      for (const group of this.specGroups) {
        const attrId = this.getAttrId(group)
        const selectedOptionId = this.selected[attrId]
        if (selectedOptionId) {
          const opt = (group.options || group.items).find(o => this.getOptionId(o) === selectedOptionId)
          if (opt) texts.push(this.getOptionName(opt))
        }
      }
      return texts.join('，')
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        // 初始化选中状态
        this.selected = {}
        // 默认选中每项的第一个选项
        this.specGroups.forEach(group => {
          const options = group.options || group.items || []
          if (options.length > 0) {
            this.selected[this.getAttrId(group)] = this.getOptionId(options[0])
          }
        })
        this.calcPrice()
      }
    }
  },
  methods: {
    // 获取规格属性ID（兼容新旧数据结构）
    getAttrId(group) {
      return group.attrId || group.id
    },
    // 获取选项ID（兼容新旧数据结构）
    getOptionId(opt) {
      return opt.optionId || opt.id
    },
    // 获取选项名称（兼容新旧数据结构）
    getOptionName(opt) {
      return opt.optionName || opt.name
    },
    // 选择规格选项
    selectOption(attrId, optionId) {
      // 重新创建 selected 对象，确保响应式更新
      this.selected = {
        ...this.selected,
        [attrId]: optionId
      }
      this.calcPrice()
    },

    // 计算价格
    calcPrice() {
      if (this.goods) {
        this.currentPrice = this.goods.defaultSpec?.price || this.goods.price || 0
      }
    },

    // 确认加入购物车
    confirm() {
      // 构建规格文本
      const specText = this.selectedSpecText
      
      // 触发确认事件
      this.$emit('confirm', {
        selected: this.selected,
        specText: specText,
        currentPrice: this.currentPrice,
        buyNum: 1
      })
      
      this.close()
    },

    // 关闭弹窗
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.spec-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.mask {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
}

.spec-content {
  background: #fff;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  max-height: 80vh;
  overflow: hidden;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

.spec-header {
  display: flex;
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  align-items: center;
}

.good-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.good-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.good-name {
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
}

.good-price {
  font-size: 32rpx;
  color: #ff6b35;
  font-weight: bold;
}

.selected-info-header {
  display: flex;
  gap: 8rpx;
}

.selected-label {
  font-size: 24rpx;
  color: #999;
  display: inline-block;
  white-space: nowrap;
}

.selected-text {
  font-size: 24rpx;
  color: #333;
}

.close-btn {
  font-size: 40rpx;
  color: #999;
  line-height: 1;
  position:absolute;
  top: 10rpx;
  width: 50rpx;
  height: 50rpx;
  text-align: center;
  right: 10rpx;
}

.spec-body {
  flex: 1;
  overflow-y: auto;
  padding: 20rpx;
}

.attr-group {
  margin-bottom: 30rpx;
}

.attr-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.option-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.option-item {
  padding: 10rpx 20rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 4rpx;
  font-size: 26rpx;
  color: #333;
  margin: 6rpx;
  background-color: #fff;
  transition: all 0.3s;
}

.option-item.active {
  border-color: #ff6b35;
  color: #ff6b35;
  background-color: #fff0f2;
}

.spec-footer {
  padding: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.confirm-btn {
  width: 100%;
  height: 88rpx;
  background: #ff6b35;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  border: none;
}

.confirm-btn:active {
  transform: scale(0.95);
}
</style>