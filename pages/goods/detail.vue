 <template>
  <view class="goods-detail-page">
    <!-- 轮播图 -->
    <view class="swiper-wrap">
      <swiper class="swiper" :indicator-dots="true" circular :autoplay="false">
        <swiper-item v-for="(img, idx) in images" :key="idx">
          <image class="swiper-img" :src="img" mode="aspectFill" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 商品信息 -->
    <view class="goods-info">
      <view class="price-box">
        <text class="price">¥{{ currentPrice }}</text>
        <text class="old-price" v-if="goods.originalPrice">¥{{ goods.originalPrice }}</text>
      </view>

      <!-- 商品名称 + 数量加减 -->
      <view class="name-cart-row">
        <view class="goods-name">{{ goods.name }}</view>
        
        <!-- 数量加减 -->
        <view class="num-box">
          <view class="num-btn" @click.stop="cutNum">-</view>
          <view class="num-text">{{ buyNum }}</view>
          <view class="num-btn" @click.stop="addNum">+</view>
        </view>
      </view>

      <!-- 商品库存信息 -->
      <view class="stock-info">
        <text class="sales">已售 {{ goods.sales }}件</text>
        <text class="stock">库存 {{ goods.stock }}件</text>
      </view>
    </view>
 
     <!-- 商品详情 -->
     <view class="detail-section" v-if="paramsList.length">
       <view class="title">商品详情</view>
       <view class="param-item">
         <view class="label">商品描述</view>
         <view class="value">{{ goods.description }}</view>
       </view>
       <view class="param-item" v-for="(item, idx) in paramsList" :key="idx">
         <view class="label">{{ item.label }}</view>
         <view class="value">{{ item.value }}</view>
       </view>
     </view>
 
     <!-- 底部占位 -->
     <view class="bottom-space"></view>
 
     <!-- 底部结算栏 -->
     <view class="bottom-bar">
       <view class="total">
         <text>合计：</text>
         <text class="price">¥{{ (currentPrice * buyNum).toFixed(2) }}</text>
       </view>
       <view class="btn-settle" @click="toSettle">去结算</view>
     </view>
 
     <!-- 规格选择弹窗 -->
     <view class="spec-popup" v-if="showSpecPopup">
       <view class="mask" @click="closeSpecPopup"></view>
       <view class="popup">
         <view class="popup-header">
           <image :src="goods.image" class="pop-img" />
           <view class="pop-info">
             <text class="pop-price">¥{{ currentPrice }}</text>
             <text>库存 {{ goods.stock }}件</text>
           </view>
           <view class="close" @click="closeSpecPopup">×</view>
         </view>
 
         <scroll-view scroll-y class="popup-body">
           <view class="attr-group" v-for="(group, gi) in specGroups" :key="gi">
             <view class="attr-title">{{ group.name }}</view>
             <view class="options">
               <view
                 class="option"
                 :class="{ active: selected[group.id] === item.id }"
                 v-for="(item, oi) in group.items"
                 :key="oi"
                 @click="selectSpec(group.id, item.id)"
               >
                 {{ item.name }}
               </view>
             </view>
           </view>
         </scroll-view>
 
         <view class="popup-footer">
           <view class="btn-confirm" @click="confirmSpec">确定</view>
         </view>
       </view>
     </view>
   </view>
</template>
 
 <script>
 export default {
   data() {
    return {
      goodsId: null,
      goods: {
        name: 'iPhone 15 Pro Max 256GB',
        price: 8999,
        originalPrice: 9999,
        sales: 150,
        stock: 50,
        image: 'https://picsum.photos/400/400?random=10',
        images: [
          'https://picsum.photos/400/400?random=10',
          'https://picsum.photos/400/400?random=11',
          'https://picsum.photos/400/400?random=12',
        ],
        description: 'A17 Pro芯片，钛金属机身，专业级摄像头系统',
      },
      specGroups: [
        {
          id: 1, name: '颜色',
          items: [
            { id: 11, name: '钛金属原色', price: 8999 },
            { id: 12, name: '蓝色钛金属', price: 8999 },
            { id: 13, name: '白色钛金属', price: 8999 },
            { id: 14, name: '黑色钛金属', price: 8999 },
          ]
        },
        {
          id: 2, name: '存储容量',
          items: [
            { id: 21, name: '256GB', price: 8999 },
            { id: 22, name: '512GB', price: 10999 },
            { id: 23, name: '1TB', price: 12999 },
          ]
        }
      ],
      selected: {},
      currentPrice: 8999,
      buyNum: 1,
      showSpecPopup: false,
      paramsList: [
        { label: '品牌', value: 'Apple' },
        { label: '型号', value: 'iPhone 15 Pro Max' },
        { label: '屏幕', value: '6.7英寸 Super Retina XDR' },
        { label: '处理器', value: 'A17 Pro' },
        { label: '摄像头', value: '4800万像素主摄' },
      ]
    }
  },
  computed: {
    images() {
      return this.goods.images || [this.goods.image]
    }
  },
	 mounted(){
		 this.goodsId = this.$Route.query.id
		 this.initDefaultSpec()
	 },
  methods: {
    initDefaultSpec() {
      this.specGroups.forEach(g => {
        if (g.items.length) this.selected[g.id] = g.items[0].id
      })
      this.calcPrice()
    },
    selectSpec(gid, iid) {
      this.selected[gid] = iid
      this.calcPrice()
    },
    calcPrice() {
      const size = this.specGroups[0].items.find(i => i.id === this.selected[1])
      this.currentPrice = size?.price || this.goods.price
    },
    openSpecPopup() {
      this.showSpecPopup = true
    },
    closeSpecPopup() {
      this.showSpecPopup = false
    },
    confirmSpec() {
      this.closeSpecPopup()
    },
    addNum() {
      this.buyNum++
    },
    cutNum() {
      if (this.buyNum <= 1) return
      this.buyNum--
    },
    toSettle() {
      uni.navigateTo({
        url: '/pages/order/confirm'
      })
    }
  }
 }
 </script>
 
 <style lang="scss" scoped>
/* 商品详情页面 */
.goods-detail-page {
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

/* 轮播 */
.swiper-wrap {
  width: 100%;
  height: 700rpx;
  background: #fff;
  position: relative;
}
.swiper {
  width: 100%;
  height: 100%;
}
.swiper-img {
  width: 100%;
  height: 100%;
  display: block;
}
 
 /* 商品信息 */
 .goods-info {
   background: #fff;
   padding: 30rpx;
   margin-top: 10rpx;
 }
 .price-box {
  display: flex;
  align-items: baseline;
  margin-bottom: 20rpx;
}
.price {
  font-size: 48rpx;
  color: #ff6000;
  font-weight: bold;
}
.old-price {
  font-size: 26rpx;
  color: #999;
  text-decoration: line-through;
  margin-left: 16rpx;
}
/* 库存信息 */
.stock-info {
  margin-top: 20rpx;
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #666;
}
 
 /* 名称 + 购物车/加减 对齐 */
 .name-cart-row {
   display: flex;
   align-items: center;
   justify-content: space-between;
   margin-bottom: 16rpx;
 }
 .goods-name {
   font-size: 34rpx;
   color: #333;
   line-height: 1.4;
   flex: 1;
 }
 
 /* 加入购物车按钮 */
 .add-cart-btn {
   padding: 12rpx 24rpx;
   background: #fff0f2;
   color: #ff2442;
   border-radius: 6rpx;
   font-size: 24rpx;
   white-space: nowrap;
 }
 
 /* 数量加减 */
 .num-box {
   display: flex;
   align-items: center;
 }
 .num-btn {
   width: 50rpx;
   height: 50rpx;
   background: #f5f5f5;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 28rpx;
   color: #666;
 }
 .num-text {
   width: 60rpx;
   text-align: center;
   font-size: 28rpx;
 }
 
 .sales {
   font-size: 24rpx;
   color: #999;
 }
 
 /* 商品详情 */
 .detail-section {
   background: #fff;
   margin-top: 10rpx;
   padding: 30rpx;
 }
 .title {
   font-size: 30rpx;
   font-weight: bold;
   color: #333;
   margin-bottom: 20rpx;
 }
 .param-item {
   display: flex;
   padding: 16rpx 0;
   border-bottom: 1rpx solid #f5f5f5;
   font-size: 26rpx;
 }
 .label {
   width: 140rpx;
   color: #999;
 }
 .value {
   flex: 1;
   color: #333;
 }
 
 /* 底部 */
 .bottom-space {
   height: 120rpx;
 }
 .bottom-bar {
   position: fixed;
   left: 0;
   right: 0;
   bottom: 0;
   height: 100rpx;
   background: #fff;
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 0 30rpx;
   box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
   z-index: 99;
 }
 .total {
  font-size: 28rpx;
  .price {
    color: #ff6000;
    font-weight: bold;
    font-size: 32rpx;
  }
}
.btn-settle {
  width: 240rpx;
  height: 70rpx;
  background: #ff6000;
  color: #fff;
  border-radius: 35rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}
 
 /* 规格弹窗 */
 .spec-popup {
   position: fixed;
   left: 0;
   top: 0;
   right: 0;
   bottom: 0;
   z-index: 999;
   display: flex;
   align-items: flex-end;
 }
 .mask {
   position: absolute;
   left: 0;
   top: 0;
   right: 0;
   bottom: 0;
   background: rgba(0,0,0,0.6);
 }
 .popup {
   background: #fff;
   border-radius: 24rpx 24rpx 0 0;
   width: 100%;
   max-height: 70vh;
   position: relative;
   animation: up 0.3s ease;
 }
 @keyframes up {
   from {transform: translateY(100%);}
   to {transform: translateY(0);}
 }
 .popup-header {
   display: flex;
   padding: 30rpx;
   position: relative;
 }
 .pop-img {
   width: 160rpx;
   height: 160rpx;
   border-radius: 12rpx;
   margin-right: 20rpx;
 }
 .pop-info {
   flex: 1;
   display: flex;
   flex-direction: column;
   justify-content: center;
 }
 .pop-price {
   font-size: 40rpx;
   color: #ff2442;
   font-weight: bold;
   margin-bottom: 10rpx;
 }
 .close {
   position: absolute;
   right: 30rpx;
   top: 30rpx;
   font-size: 40rpx;
   color: #999;
 }
 .popup-body {
   padding: 0 30rpx;
   max-height: 40vh;
 }
 .attr-group {
   margin-bottom: 30rpx;
 }
 .attr-title {
   font-size: 28rpx;
   font-weight: bold;
   margin-bottom: 20rpx;
 }
 .options {
   display: flex;
   flex-wrap: wrap;
   gap: 16rpx;
 }
 .option {
   padding: 14rpx 28rpx;
   background: #f5f5f5;
   border-radius: 8rpx;
   font-size: 26rpx;
   border: 2rpx solid transparent;
 }
 .option.active {
   background: #fff0f2;
   color: #ff2442;
   border-color: #ff2442;
 }
 .popup-footer {
   padding: 20rpx 30rpx;
 }
 .btn-confirm {
  width: 100%;
  height: 80rpx;
  background: #ff6000;
  color: #fff;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
}
 </style>