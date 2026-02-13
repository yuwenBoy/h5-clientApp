 <!-- pages/store/detail.vue -->
 <template>
   <view class="store-page">
     <!-- 头部不变... -->
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
                 
                 <!-- 关键修改：步进器组件 -->
                 <view class="stepper">
                   <!-- 减号：数量大于0时显示 -->
                   <view 
                     class="btn-minus" 
                     v-if="getGoodsCount(goods) > 0"
                     @click.stop="decreaseGoods(goods)"
                   >
                     <text class="minus-icon">−</text>
                   </view>
                   
                   <!-- 数量：大于0时显示 -->
                   <text class="stepper-num" v-if="getGoodsCount(goods) > 0">
                     {{ getGoodsCount(goods) }}
                   </text>
                   
                   <!-- 加号：始终显示 -->
                   <view class="btn-plus" @click.stop="increaseGoods(goods)">
                     <text class="plus-icon">+</text>
                   </view>
                 </view>
               </view>
             </view>
           </view>
         </view>
         <view class="bottom-placeholder"></view>
       </scroll-view>
     </view>
 
     <!-- 底部购物车栏 -->
     <view class="cart-bar-wrapper" v-if="cartList.length > 0">
       <view class="cart-bar" @click="showCart = true">
         <view class="cart-icon">
           <view class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</view>
           <text class="cart-text">购物车</text>
         </view>
         <view class="cart-info">
           <text class="cart-price">¥{{ cartPrice }}</text>
           <text class="cart-tip">另需配送费 ¥5</text>
         </view>
         <view class="cart-btn" :class="{ canSubmit: cartPrice >= 30 }" @click.stop="goToConfirm">
           {{ cartPrice >= 30 ? '去结算' : `差¥${(30 - cartPrice).toFixed(1)}起送` }}
         </view>
       </view>
     </view>
 
     <!-- 购物车弹窗 -->
     <view class="cart-popup" v-if="showCart" @click.self="showCart = false">
       <view class="cart-mask"></view>
       <view class="cart-content">
         <view class="cart-header">
           <text class="header-title">已选商品</text>
           <view class="clear-btn" @click="clearCart">
             <uni-icons type="trash" size="16" color="#999" />
             <text>清空</text>
           </view>
         </view>
         
         <scroll-view class="cart-list" scroll-y>
           <view v-for="(item, index) in cartList" :key="index" class="cart-item">
             <image class="item-img" :src="item.img" mode="aspectFill" />
             <view class="item-info">
               <text class="item-name">{{ item.name }}</text>
               <text class="item-sku" v-if="item.sku">{{ item.sku }}</text>
               <text class="item-price">¥{{ item.price }}</text>
             </view>
             <view class="item-stepper">
               <view class="btn-minus" @click="decreaseCartItem(index)">
                 <text>−</text>
               </view>
               <text class="stepper-num">{{ item.count }}</text>
               <view class="btn-plus" @click="increaseCartItem(index)">
                 <text>+</text>
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
       activeCat: 0,
       sidebarScrollTop: 0,
       goodsScrollTop: 0,
       isClicking: false,
       sectionTops: [],
       showCart: false,
       
       // 购物车列表
       cartList: [],
       
       categories: [
         {
           name: '热销推荐',
           goods: [
             { id: 1, name: '香辣鸡腿堡套餐', desc: '香辣鸡腿堡+中薯条+中可乐', price: 29.9, original: 45, sales: 9999, img: 'https://picsum.photos/200/200?random=1' },
             { id: 2, name: '全家桶（5块原味鸡）', desc: '5块原味鸡+3对辣翅+土豆泥+可乐', price: 69, original: 99, sales: 8888, img: 'https://picsum.photos/200/200?random=2' },
             { id: 3, name: '新奥尔良烤翅（4块）', desc: '经典烤翅，鲜嫩多汁', price: 19.9, original: 28, sales: 6666, img: 'https://picsum.photos/200/200?random=3' },
             { id: 4, name: '葡式蛋挞（6只）', desc: '酥脆挞皮，香滑蛋液', price: 25, original: 36, sales: 5555, img: 'https://picsum.photos/200/200?random=4' }
           ]
         },
         {
           name: '汉堡主食',
           goods: [
             { id: 5, name: '老北京鸡肉卷', desc: '经典口味，酱香浓郁', price: 18.5, original: 25, sales: 4321, img: 'https://picsum.photos/200/200?random=5' },
             { id: 6, name: '劲脆鸡腿堡', desc: '大块鸡腿肉，外脆里嫩', price: 19, original: 26, sales: 3456, img: 'https://picsum.photos/200/200?random=6' },
             { id: 7, name: '新奥尔良烤鸡腿堡', desc: '烤制工艺，健康美味', price: 20, original: 28, sales: 2890, img: 'https://picsum.photos/200/200?random=7' }
           ]
         },
         {
           name: '小食甜品',
           goods: [
             { id: 8, name: '薯条（大）', desc: '金黄酥脆，停不下来', price: 14, original: 18, sales: 7654, img: 'https://picsum.photos/200/200?random=8' },
             { id: 9, name: '鸡米花', desc: '粒粒香脆，一口一个', price: 12, original: 16, sales: 6543, img: 'https://picsum.photos/200/200?random=9' },
             { id: 10, name: '圣代（草莓/巧克力）', desc: '冰爽甜蜜，夏日首选', price: 9, original: 12, sales: 8765, img: 'https://picsum.photos/200/200?random=10' }
           ]
         },
         {
           name: '饮料冷饮',
           goods: [
             { id: 11, name: '中杯可乐', desc: '冰爽畅快', price: 9, original: 12, sales: 9999, img: 'https://picsum.photos/200/200?random=11' },
             { id: 12, name: '九珍果汁', desc: '九种水果，维C满满', price: 11, original: 14, sales: 5432, img: 'https://picsum.photos/200/200?random=12' },
             { id: 13, name: '雪顶咖啡', desc: '咖啡与冰淇淋的完美结合', price: 13, original: 16, sales: 4321, img: 'https://picsum.photos/200/200?random=13' }
           ]
         },
         { name: '早餐专区', goods: [
           { id: 14, name: '皮蛋瘦肉粥', desc: '暖胃早餐', price: 8, original: 10, sales: 3333, img: 'https://picsum.photos/200/200?random=14' },
           { id: 15, name: '油条（2根）', desc: '酥脆可口', price: 5, original: 6, sales: 2222, img: 'https://picsum.photos/200/200?random=15' }
         ]},
         { name: '夜宵特惠', goods: [
           { id: 16, name: '炸鸡桶', desc: '深夜福利', price: 39, original: 59, sales: 1111, img: 'https://picsum.photos/200/200?random=16' }
         ]},
         { name: '儿童套餐', goods: [
           { id: 17, name: '开心乐园餐', desc: '送玩具', price: 22, original: 28, sales: 4444, img: 'https://picsum.photos/200/200?random=17' }
         ]}
       ]
     }
   },
   
   computed: {
     // 购物车总数量
     cartCount() {
       return this.cartList.reduce((sum, item) => sum + item.count, 0)
     },
     // 购物车总价
     cartPrice() {
       return this.cartList.reduce((sum, item) => sum + item.price * item.count, 0).toFixed(1)
     }
   },
   
   onReady() {
     setTimeout(() => {
       this.calcSectionTops()
     }, 100)
   },
   
   methods: {
     // 计算分类位置
     calcSectionTops() {
       const query = uni.createSelectorQuery().in(this)
       query.select('.goods-list').boundingClientRect()
       this.categories.forEach((_, index) => {
         query.select(`.cat-section:nth-child(${index + 1})`).boundingClientRect()
       })
       query.exec(res => {
         if (!res || !res[0]) return
         const listTop = res[0].top
         this.sectionTops = res.slice(1).map((item) => {
           if (!item) return 0
           return item.top - listTop
         })
       })
     },
     
     // 获取商品在购物车中的数量
     getGoodsCount(goods) {
       const item = this.cartList.find(item => item.id === goods.id)
       return item ? item.count : 0
     },
     
     // 增加商品
     increaseGoods(goods) {
       const exist = this.cartList.find(item => item.id === goods.id)
       if (exist) {
         exist.count++
       } else {
         this.cartList.push({
           id: goods.id,
           name: goods.name,
           price: goods.price,
           img: goods.img,
           count: 1
         })
       }
     },
     
     // 减少商品
     decreaseGoods(goods) {
       const index = this.cartList.findIndex(item => item.id === goods.id)
       if (index > -1) {
         const item = this.cartList[index]
         if (item.count > 1) {
           item.count--
         } else {
           // 数量为1时移除
           this.cartList.splice(index, 1)
         }
       }
     },
     
     // 分类点击
     clickCategory(index) {
       this.activeCat = index
       this.isClicking = true
       if (this.sectionTops[index] !== undefined) {
         this.goodsScrollTop = this.sectionTops[index]
       }
       this.scrollSidebarToVisible(index)
       setTimeout(() => {
         this.isClicking = false
       }, 500)
     },
     
     scrollSidebarToVisible(index) {
       const itemHeight = 90
       const visibleHeight = 400
       const scrollPosition = index * itemHeight
       if (scrollPosition > visibleHeight / 2) {
         this.sidebarScrollTop = scrollPosition - visibleHeight / 2
       } else {
         this.sidebarScrollTop = 0
       }
     },
     
     onGoodsScroll(e) {
       if (this.isClicking) return
       const scrollTop = e.detail.scrollTop
       let currentIndex = 0
       for (let i = 0; i < this.sectionTops.length; i++) {
         if (scrollTop >= this.sectionTops[i] - 50) {
           currentIndex = i
         }
       }
       if (currentIndex >= this.categories.length - 1) {
         currentIndex = this.categories.length - 1
       }
       if (currentIndex !== this.activeCat) {
         this.activeCat = currentIndex
         this.scrollSidebarToVisible(currentIndex)
       }
     },
     
     // 购物车弹窗操作
     increaseCartItem(index) {
       this.cartList[index].count++
     },
     
     decreaseCartItem(index) {
       const item = this.cartList[index]
       if (item.count > 1) {
         item.count--
       } else {
         this.cartList.splice(index, 1)
       }
     },
     
     // 清空购物车
     clearCart() {
       uni.showModal({
         title: '提示',
         content: '确定清空购物车吗？',
         success: (res) => {
           if (res.confirm) {
             this.cartList = []
             this.showCart = false
           }
         }
       })
     },
     
     // 去结算
     goToConfirm() {
       if (this.cartPrice < 30) return
       uni.navigateTo({
         url: `/pages/order/confirm?storeId=1&total=${this.cartPrice}`
       })
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
   overflow: hidden;
 }
 
 .store-header {
   flex-shrink: 0;
   background: #fff;
   
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
   
   .category-sidebar {
     width: 160rpx;
     height: 100%;
     background: #f8f8f8;
     
     .cat-item {
       padding: 30rpx 20rpx;
       font-size: 26rpx;
       color: #666;
       text-align: center;
       position: relative;
       transition: all 0.2s;
       min-height: 90rpx;
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
         
         .goods-name {
           font-size: 30rpx;
           font-weight: bold;
           color: #333;
         }
         
         .goods-desc {
           font-size: 24rpx;
           color: #999;
         }
         
         .goods-sales {
           font-size: 24rpx;
           color: #999;
         }
         
         .goods-bottom {
           display: flex;
           justify-content: space-between;
           align-items: center;
           
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
           
           // 关键：步进器样式
           .stepper {
             display: flex;
             align-items: center;
             
             .btn-minus {
               width: 44rpx;
               height: 44rpx;
               border: 2rpx solid #e0e0e0;
               border-radius: 50%;
               display: flex;
               align-items: center;
               justify-content: center;
               background: #fff;
               
               .minus-icon {
                 font-size: 28rpx;
                 color: #666;
                 font-weight: bold;
               }
             }
             
             .stepper-num {
               min-width: 50rpx;
               text-align: center;
               font-size: 28rpx;
               color: #333;
               font-weight: bold;
             }
             
             .btn-plus {
               width: 44rpx;
               height: 44rpx;
               background: $primary;
               border-radius: 50%;
               display: flex;
               align-items: center;
               justify-content: center;
               
               .plus-icon {
                 font-size: 28rpx;
                 color: #fff;
                 font-weight: bold;
               }
             }
           }
         }
       }
     }
     
     .bottom-placeholder {
       height: 120rpx;
     }
   }
 }
 
 // 底部购物车栏
 .cart-bar-wrapper {
   position: fixed;
   left: 0;
   right: 0;
   bottom: 0;
   z-index: 100;
   padding-bottom: env(safe-area-inset-bottom);
   background: #fff;
   border-top: 1rpx solid #eee;
   
   .cart-bar {
     display: flex;
     align-items: center;
     padding: 20rpx 30rpx;
     height: 100rpx;
     box-sizing: border-box;
     
     .cart-icon {
       position: relative;
       width: 80rpx;
       height: 80rpx;
       background: $primary;
       border-radius: 50%;
       display: flex;
       align-items: center;
       justify-content: center;
       
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
       
       &.canSubmit {
         background: $primary;
       }
     }
   }
 }
 
 // 购物车弹窗
 .cart-popup {
   position: fixed;
   left: 0;
   right: 0;
   top: 0;
   bottom: 0;
   z-index: 999;
   
   .cart-mask {
     position: absolute;
     left: 0;
     right: 0;
     top: 0;
     bottom: 0;
     background: rgba(0,0,0,0.5);
   }
   
   .cart-content {
     position: absolute;
     left: 0;
     right: 0;
     bottom: 0;
     background: #fff;
     border-radius: 20rpx 20rpx 0 0;
     max-height: 70vh;
     display: flex;
     flex-direction: column;
     
     .cart-header {
       display: flex;
       justify-content: space-between;
       align-items: center;
       padding: 30rpx;
       border-bottom: 1rpx solid #eee;
       
       .header-title {
         font-size: 30rpx;
         font-weight: bold;
         color: #333;
       }
       
       .clear-btn {
         display: flex;
         align-items: center;
         font-size: 26rpx;
         color: #999;
         
         text {
           margin-left: 8rpx;
         }
       }
     }
     
     .cart-list {
       flex: 1;
       overflow-y: auto;
       padding: 0 30rpx;
       
       .cart-item {
         display: flex;
         align-items: center;
         padding: 20rpx 0;
         border-bottom: 1rpx solid #f5f5f5;
         
         .item-img {
           width: 100rpx;
           height: 100rpx;
           border-radius: 8rpx;
           margin-right: 20rpx;
         }
         
         .item-info {
           flex: 1;
           
           .item-name {
             font-size: 28rpx;
             color: #333;
             margin-bottom: 8rpx;
           }
           
           .item-sku {
             font-size: 24rpx;
             color: #999;
             margin-bottom: 8rpx;
           }
           
           .item-price {
             font-size: 28rpx;
             color: $primary;
             font-weight: bold;
           }
         }
         
         .item-stepper {
           display: flex;
           align-items: center;
           
           .btn-minus, .btn-plus {
             width: 48rpx;
             height: 48rpx;
             border-radius: 50%;
             display: flex;
             align-items: center;
             justify-content: center;
             font-size: 28rpx;
           }
           
           .btn-minus {
             border: 2rpx solid #e0e0e0;
             color: #666;
             background: #fff;
           }
           
           .btn-plus {
             background: $primary;
             color: #fff;
           }
           
           .stepper-num {
             min-width: 60rpx;
             text-align: center;
             font-size: 28rpx;
             color: #333;
           }
         }
       }
     }
   }
 }
 </style>
