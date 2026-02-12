<!-- pages/store/detail.vue -->
<template>
  <view class="store-page">
    <!-- 头部不变 -->
    <view class="store-header">
      <view class="header-bg"></view>
      <view class="store-info">
        <image class="store-logo" src="https://picsum.photos/100/100?random=10" />
        <view class="store-meta">
          <view class="store-name">肯德基宅急送（朝阳大悦城店）</view>
          <view class="store-tags">
            <text class="tag">30分钟送达</text>
            <text class="tag">月售9999+</text>
            <text class="tag">4.8分</text>
          </view>
          <view class="store-notice">公告：本店支持开发票，满30元起送</view>
        </view>
      </view>
      <view class="coupon-bar">
        <view class="coupon-item">
          <text class="coupon-value">满30减5</text>
          <text class="coupon-btn">领券</text>
        </view>
        <view class="coupon-item">
          <text class="coupon-value">满50减12</text>
          <text class="coupon-btn">领券</text>
        </view>
      </view>
    </view>

    <!-- 主体内容 -->
    <view class="main-content">
      <!-- 左侧分类 -->
      <scroll-view 
        class="category-sidebar" 
        scroll-y 
        :scroll-top="sidebarScrollTop"
        scroll-with-animation
      >
        <view 
          v-for="(cat, index) in categories" 
          :key="index"
          class="cat-item"
          :class="{ active: activeCat === index }"
          @click="clickCategory(index)"
        >
          {{ cat.name }}
        </view>
      </scroll-view>

      <!-- 右侧商品列表 -->
      <scroll-view 
        class="goods-list" 
        scroll-y 
        :scroll-top="goodsScrollTop"
        scroll-with-animation
        @scroll="onGoodsScroll"
        @scrolltolower="loadMore"
      >
        <view 
          v-for="(cat, cIndex) in categories" 
          :key="cIndex" 
          class="cat-section"
        >
          <view class="cat-title">{{ cat.name }}</view>
          <view 
            v-for="(goods, gIndex) in cat.goods" 
            :key="gIndex"
            class="goods-item"
          >
            <image class="goods-img" :src="goods.img" mode="aspectFill" />
            <view class="goods-info">
              <view class="goods-name">{{ goods.name }}</view>
              <view class="goods-desc">{{ goods.desc }}</view>
              <view class="goods-sales">月售 {{ goods.sales }}</view>
              <view class="goods-bottom">
                <view class="price-box">
                  <text class="price-symbol">¥</text>
                  <text class="price-value">{{ goods.price }}</text>
                  <text class="price-original">¥{{ goods.original }}</text>
                </view>
                <view class="add-btn" @click="addToCart(goods)">
                  <text class="add-icon">+</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <!-- 底部占位，确保能滚动到底 -->
        <view class="bottom-placeholder"></view>
      </scroll-view>
    </view>

    <!-- 底部购物车 -->
    <view class="cart-bar" :class="{ active: cartCount > 0 }">
      <view class="cart-icon" @click="showCart = true">
        <view class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</view>
        <text class="cart-text">购物车</text>
      </view>
      <view class="cart-info">
        <text class="cart-price">¥{{ cartPrice }}</text>
        <text class="cart-tip">另需配送费 ¥5</text>
      </view>
      <view class="cart-btn" :class="{ canSubmit: cartPrice >= 30 }" @click="canSubmit">
        {{ cartPrice >= 30 ? '去结算' : `差¥${(30 - cartPrice).toFixed(1)}起送` }}
      </view>
    </view>

    <!-- 购物车弹窗 -->
    <view class="cart-popup" v-if="showCart" @click.self="showCart = false">
      <view class="cart-content">
        <view class="cart-header">
          <text>已选商品</text>
          <text class="clear-btn" @click="clearCart">清空</text>
        </view>
        <scroll-view class="cart-list" scroll-y>
          <view v-for="(item, index) in cartList" :key="index" class="cart-item">
            <text class="item-name">{{ item.name }}</text>
            <view class="item-control">
              <text class="item-price">¥{{ item.price * item.count }}</text>
              <view class="stepper">
                <text class="minus" @click="item.count > 1 ? item.count-- : removeFromCart(index)">-</text>
                <text class="num">{{ item.count }}</text>
                <text class="plus" @click="item.count++">+</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeCat: 0,              // 当前激活的分类
      sidebarScrollTop: 0,       // 左侧滚动位置
      goodsScrollTop: 0,         // 右侧滚动位置
      isClicking: false,         // 是否正在点击切换
      sectionTops: [],           // 各分类区域顶部位置
      categories: [
        {
          name: '热销推荐',
          goods: [
            { name: '香辣鸡腿堡套餐', desc: '香辣鸡腿堡+中薯条+中可乐', price: 29.9, original: 45, sales: 9999, img: 'https://picsum.photos/200/200?random=1' },
            { name: '全家桶（5块原味鸡）', desc: '5块原味鸡+3对辣翅+土豆泥+可乐', price: 69, original: 99, sales: 8888, img: 'https://picsum.photos/200/200?random=2' },
            { name: '新奥尔良烤翅（4块）', desc: '经典烤翅，鲜嫩多汁', price: 19.9, original: 28, sales: 6666, img: 'https://picsum.photos/200/200?random=3' },
            { name: '葡式蛋挞（6只）', desc: '酥脆挞皮，香滑蛋液', price: 25, original: 36, sales: 5555, img: 'https://picsum.photos/200/200?random=4' }
          ]
        },
        {
          name: '汉堡主食',
          goods: [
            { name: '老北京鸡肉卷', desc: '经典口味，酱香浓郁', price: 18.5, original: 25, sales: 4321, img: 'https://picsum.photos/200/200?random=5' },
            { name: '劲脆鸡腿堡', desc: '大块鸡腿肉，外脆里嫩', price: 19, original: 26, sales: 3456, img: 'https://picsum.photos/200/200?random=6' },
            { name: '新奥尔良烤鸡腿堡', desc: '烤制工艺，健康美味', price: 20, original: 28, sales: 2890, img: 'https://picsum.photos/200/200?random=7' }
          ]
        },
        {
          name: '小食甜品',
          goods: [
            { name: '薯条（大）', desc: '金黄酥脆，停不下来', price: 14, original: 18, sales: 7654, img: 'https://picsum.photos/200/200?random=8' },
            { name: '鸡米花', desc: '粒粒香脆，一口一个', price: 12, original: 16, sales: 6543, img: 'https://picsum.photos/200/200?random=9' },
            { name: '圣代（草莓/巧克力）', desc: '冰爽甜蜜，夏日首选', price: 9, original: 12, sales: 8765, img: 'https://picsum.photos/200/200?random=10' }
          ]
        },
        {
          name: '饮料冷饮',
          goods: [
            { name: '中杯可乐', desc: '冰爽畅快', price: 9, original: 12, sales: 9999, img: 'https://picsum.photos/200/200?random=11' },
            { name: '九珍果汁', desc: '九种水果，维C满满', price: 11, original: 14, sales: 5432, img: 'https://picsum.photos/200/200?random=12' },
            { name: '雪顶咖啡', desc: '咖啡与冰淇淋的完美结合', price: 13, original: 16, sales: 4321, img: 'https://picsum.photos/200/200?random=13' }
          ]
        },
        { name: '早餐专区', goods: [
          { name: '皮蛋瘦肉粥', desc: '暖胃早餐', price: 8, original: 10, sales: 3333, img: 'https://picsum.photos/200/200?random=14' },
          { name: '油条（2根）', desc: '酥脆可口', price: 5, original: 6, sales: 2222, img: 'https://picsum.photos/200/200?random=15' }
        ]},
        { name: '夜宵特惠', goods: [
          { name: '炸鸡桶', desc: '深夜福利', price: 39, original: 59, sales: 1111, img: 'https://picsum.photos/200/200?random=16' }
        ]},
        { name: '儿童套餐', goods: [
          { name: '开心乐园餐', desc: '送玩具', price: 22, original: 28, sales: 4444, img: 'https://picsum.photos/200/200?random=17' }
        ]}
      ],
      cartList: [],
      showCart: false
    }
  },
  
  computed: {
    cartCount() {
      return this.cartList.reduce((sum, item) => sum + item.count, 0)
    },
    cartPrice() {
      return this.cartList.reduce((sum, item) => sum + item.price * item.count, 0).toFixed(1)
    }
  },
  
  onReady() {
    // 延迟计算，确保渲染完成
    setTimeout(() => {
      this.calcSectionTops()
    }, 100)
  },
  
  methods: {
    // 计算各分类区域高度
    calcSectionTops() {
      const query = uni.createSelectorQuery().in(this)
      
      // 获取 goods-list 的顶部位置
      query.select('.goods-list').boundingClientRect()
      
      // 获取每个分类区域的位置
      this.categories.forEach((_, index) => {
        query.select(`.cat-section:nth-child(${index + 1})`).boundingClientRect()
      })
      
      query.exec(res => {
        if (!res || !res[0]) return
        
        const listTop = res[0].top  // goods-list 的顶部位置
        
        // 计算每个分类相对于 goods-list 的偏移量
        this.sectionTops = res.slice(1).map((item, index) => {
          if (!item) return 0
          // 当前分类顶部 - 列表顶部 = 滚动距离
          return item.top - listTop
        })
        
        console.log('分类位置:', this.sectionTops)
      })
    },
    
    // 点击左侧分类
    clickCategory(index) {
      this.activeCat = index
      this.isClicking = true
      
      // 滚动到对应位置
      if (this.sectionTops[index] !== undefined) {
        this.goodsScrollTop = this.sectionTops[index]
      }
      
      // 左侧分类滚动到可视区域
      this.scrollSidebarToVisible(index)
      
      // 500ms后恢复滚动监听（延长防止闪烁）
      setTimeout(() => {
        this.isClicking = false
      }, 500)
    },
    
    // 左侧分类滚动到可视区域
    scrollSidebarToVisible(index) {
      const itemHeight = 90  // 每个分类项大约高度（rpx）
      const visibleHeight = 400  // 可视区域高度（rpx）
      const scrollPosition = index * itemHeight
      
      // 如果超出可视区域，滚动左侧
      if (scrollPosition > visibleHeight / 2) {
        this.sidebarScrollTop = scrollPosition - visibleHeight / 2
      } else {
        this.sidebarScrollTop = 0
      }
    },
    
    // 右侧滚动监听
    onGoodsScroll(e) {
      // 点击触发的滚动，不处理
      if (this.isClicking) return
      
      const scrollTop = e.detail.scrollTop
      
      // 找到当前滚动位置对应的分类
      let currentIndex = 0
      for (let i = 0; i < this.sectionTops.length; i++) {
        // 当前滚动位置超过分类顶部，且下一个分类还没到达
        if (scrollTop >= this.sectionTops[i] - 50) {
          currentIndex = i
        }
      }
      
      // 边界处理：最后一个分类
      if (currentIndex >= this.categories.length - 1) {
        currentIndex = this.categories.length - 1
      }
      
      if (currentIndex !== this.activeCat) {
        this.activeCat = currentIndex
        this.scrollSidebarToVisible(currentIndex)
      }
    },
    
    loadMore() {
      console.log('加载更多')
    },
    
    addToCart(goods) {
      const exist = this.cartList.find(item => item.name === goods.name)
      if (exist) {
        exist.count++
      } else {
        this.cartList.push({ ...goods, count: 1 })
      }
    },
    
    removeFromCart(index) {
      this.cartList.splice(index, 1)
    },
    
    clearCart() {
      this.cartList = []
      this.showCart = false
    },
		canSubmit(){
			console.log('去结算')
			 uni.navigateTo({ url: `/pages/order/orderSubmit` });
		}
  }
}
</script>

<style lang="scss" scoped>
$primary: #ff6b35;

.store-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.store-header {
  position: relative;
  background: #fff;
  flex-shrink: 0;
  
  .header-bg {
    height: 100rpx;
    background: linear-gradient(135deg, $primary 0%, lighten($primary, 15%) 100%);
  }
  
  .store-info {
    display: flex;
    padding: 0 30rpx 20rpx;
    margin-top: -50rpx;
    
    .store-logo {
      width: 120rpx;
      height: 120rpx;
      border-radius: 12rpx;
      border: 4rpx solid #fff;
      background: #fff;
    }
    
    .store-meta {
      flex: 1;
      margin-left: 20rpx;
      
      .store-name {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
      
      .store-tags {
        margin-top: 10rpx;
        
        .tag {
          display: inline-block;
          padding: 4rpx 12rpx;
          margin-right: 10rpx;
          font-size: 22rpx;
          color: $primary;
          background: rgba($primary, 0.1);
          border-radius: 4rpx;
        }
      }
      
      .store-notice {
        margin-top: 10rpx;
        font-size: 24rpx;
        color: #999;
      }
    }
  }
  
  .coupon-bar {
    display: flex;
    padding: 0 30rpx 20rpx;
    gap: 20rpx;
    
    .coupon-item {
      display: flex;
      align-items: center;
      padding: 8rpx 16rpx;
      background: linear-gradient(90deg, rgba($primary, 0.1) 0%, #fff 100%);
      border: 1rpx solid rgba($primary, 0.3);
      border-radius: 8rpx;
      
      .coupon-value {
        font-size: 24rpx;
        color: $primary;
        font-weight: bold;
      }
      
      .coupon-btn {
        margin-left: 16rpx;
        padding: 4rpx 16rpx;
        font-size: 22rpx;
        color: #fff;
        background: $primary;
        border-radius: 20rpx;
      }
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0; // 关键：防止flex子项溢出
  
  .category-sidebar {
    width: 160rpx;
    height: 100%;
    background: #f8f8f8;
    flex-shrink: 0;
    
    .cat-item {
      padding: 30rpx 20rpx;
      font-size: 26rpx;
      color: #666;
      text-align: center;
      position: relative;
      transition: all 0.2s;
      min-height: 90rpx;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.active {
        background: #fff;
        color: $primary;
        font-weight: bold;
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 6rpx;
          height: 40rpx;
          background: $primary;
        }
      }
    }
  }
  
  .goods-list {
    flex: 1;
    height: 100%;
    background: #fff;
    
    .cat-section {
      padding: 20rpx;
      
      .cat-title {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 20rpx;
        padding-left: 16rpx;
        border-left: 6rpx solid $primary;
      }
    }
    
    .goods-item {
      display: flex;
      margin-bottom: 30rpx;
      
      .goods-img {
        width: 180rpx;
        height: 180rpx;
        border-radius: 12rpx;
        flex-shrink: 0;
      }
      
      .goods-info {
        flex: 1;
        margin-left: 20rpx;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-width: 0;
        
        .goods-name {
          font-size: 30rpx;
          font-weight: bold;
          color: #333;
          line-height: 1.4;
        }
        
        .goods-desc {
          font-size: 24rpx;
          color: #999;
          margin-top: 8rpx;
          line-height: 1.3;
        }
        
        .goods-sales {
          font-size: 24rpx;
          color: #999;
          margin-top: 8rpx;
        }
        
        .goods-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10rpx;
          
          .price-box {
            .price-symbol {
              font-size: 24rpx;
              color: $primary;
            }
            
            .price-value {
              font-size: 36rpx;
              font-weight: bold;
              color: $primary;
            }
            
            .price-original {
              margin-left: 10rpx;
              font-size: 24rpx;
              color: #999;
              text-decoration: line-through;
            }
          }
          
          .add-btn {
            width: 48rpx;
            height: 48rpx;
            background: $primary;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            
            .add-icon {
              color: #fff;
              font-size: 32rpx;
              font-weight: bold;
            }
          }
        }
      }
    }
    
    // 底部占位，确保能滚动到底
    .bottom-placeholder {
      height: 200rpx;
    }
  }
}

.cart-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
  flex-shrink: 0;
  
  &.active {
    .cart-icon {
      background: $primary;
    }
  }
  
  .cart-icon {
    position: relative;
    width: 80rpx;
    height: 80rpx;
    background: #999;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    .cart-badge {
      position: absolute;
      top: -10rpx;
      right: -10rpx;
      min-width: 36rpx;
      height: 36rpx;
      padding: 0 10rpx;
      background: #ff4d4f;
      color: #fff;
      font-size: 22rpx;
      border-radius: 18rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .cart-text {
      color: #fff;
      font-size: 20rpx;
    }
  }
  
  .cart-info {
    flex: 1;
    margin-left: 20rpx;
    min-width: 0;
    
    .cart-price {
      font-size: 36rpx;
      font-weight: bold;
      color: $primary;
    }
    
    .cart-tip {
      margin-left: 10rpx;
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .cart-btn {
    padding: 16rpx 40rpx;
    background: #ccc;
    color: #fff;
    font-size: 28rpx;
    border-radius: 40rpx;
    flex-shrink: 0;
    white-space: nowrap;
    
    &.canSubmit {
      background: $primary;
    }
  }
}

.cart-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 120rpx;
  top: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  
  .cart-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 600rpx;
    background: #fff;
    border-radius: 20rpx 20rpx 0 0;
    display: flex;
    flex-direction: column;
    
    .cart-header {
      display: flex;
      justify-content: space-between;
      padding: 30rpx;
      border-bottom: 1rpx solid #eee;
      flex-shrink: 0;
      
      .clear-btn {
        color: #999;
      }
    }
    
    .cart-list {
      max-height: 400rpx;
      padding: 20rpx 30rpx;
      overflow-y: auto;
      
      .cart-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx 0;
        border-bottom: 1rpx solid #f5f5f5;
        
        .item-name {
          font-size: 28rpx;
          color: #333;
          flex: 1;
          margin-right: 20rpx;
        }
        
        .item-control {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          
          .item-price {
            margin-right: 20rpx;
            color: $primary;
            font-weight: bold;
          }
          
          .stepper {
            display: flex;
            align-items: center;
            
            .minus, .plus {
              width: 44rpx;
              height: 44rpx;
              background: #f5f5f5;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28rpx;
            }
            
            .plus {
              background: $primary;
              color: #fff;
            }
            
            .num {
              margin: 0 20rpx;
              font-size: 28rpx;
              min-width: 40rpx;
              text-align: center;
            }
          }
        }
      }
    }
  }
}
</style>
