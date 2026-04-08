 <template>
   <view class="flash-goods-page">
     <!-- 加载状态 -->
     <view class="loading-container" v-if="loading">
       <uni-load-more status="loading" />
     </view>
     
     <!-- 商品内容 -->
     <template v-else>
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
 
       <!-- 商品名称 + 加入购物车 / 加减 对齐 -->
       <view class="name-cart-row">
         <view class="goods-name">{{ goods.name }}</view>
 
         <!-- 已选规格 → 显示加减 -->
         <view class="num-box" v-if="selectedSpecText">
           <view class="num-btn" @click.stop="cutNum">-</view>
           <view class="num-text">{{ buyNum }}</view>
           <view class="num-btn" @click.stop="addNum">+</view>
         </view>
 
         <!-- 未选规格 → 显示加入购物车 -->
         <view class="add-cart-btn" v-else @click="toAddCart">
           加入购物车
         </view>
       </view>
 
       <view class="sales">已售 {{ goods.sales }}件</view>
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
    </template>
 
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
         name: '',
         price: 0,
         originalPrice: 0,
         sales: 0,
         stock: 0,
         image: '',
         images: [],
         description: '',
         storeId: ''
       },
       hasSpec: false,
       specGroups: [],
       selected: {},
       currentPrice: 0,
       buyNum: 1,
       showSpecPopup: false,
       paramsList: [],
       loading: false
     }
   },
   computed: {
     images() {
       return this.goods.images && this.goods.images.length > 0 ? this.goods.images : [this.goods.image]
     },
     selectedSpecText() {
       let arr = []
       this.specGroups.forEach(g => {
         const item = g.items.find(i => i.id === this.selected[g.id])
         if (item) arr.push(item.name)
       })
       return arr.join(' ')
     }
   },
   mounted() {
     this.goodsId = this.$Route.query.id
     if (this.goodsId) {
       this.getGoodsDetail()
     }
   },
   methods: {
     async getGoodsDetail() {
       if (this.loading) return
       this.loading = true
       try {
         const { result } = await this.$request.post(this.$apis.goods.detail, { goodsId: this.goodsId })
         this.goods = result.goods || {}
         this.specGroups = result.specGroups || []
         this.paramsList = result.paramsList || []
         this.hasSpec = this.specGroups.length > 0
         this.initDefaultSpec()
       } catch (error) {
         uni.showToast({
           title: '获取商品详情失败',
           icon: 'none'
         })
       } finally {
         this.loading = false
       }
     },
     initDefaultSpec() {
       this.specGroups.forEach(g => {
         if (g.items && g.items.length) {
           this.selected[g.id] = g.items[0].id
         }
       })
       this.calcPrice()
     },
     selectSpec(gid, iid) {
       this.selected[gid] = iid
       this.calcPrice()
     },
     calcPrice() {
       if (this.specGroups.length === 0) {
         this.currentPrice = this.goods.price
         return
       }
       const size = this.specGroups[0].items.find(i => i.id === this.selected[this.specGroups[0].id])
       this.currentPrice = size?.price || this.goods.price
     },
     toAddCart() {
       if (this.hasSpec) {
         this.openSpecPopup()
         return
       }
       this.confirmSpec()
     },
     openSpecPopup() {
       this.showSpecPopup = true
     },
     closeSpecPopup() {
       this.showSpecPopup = false
     },
     async confirmSpec() {
       try {
         const params = {
           goodsId: this.goodsId,
           specId: this.hasSpec ? this.getSelectedSpecId() : null,
           quantity: this.buyNum
         }
         await this.$request.post(this.$apis.goods.addToCart, params)
         this.closeSpecPopup()
         uni.showToast({
           title: '已加入购物车',
           icon: 'success'
         })
       } catch (error) {
         uni.showToast({
           title: '加入购物车失败',
           icon: 'none'
         })
       }
     },
     getSelectedSpecId() {
       if (!this.hasSpec) return null
       const specIds = Object.values(this.selected).join(',')
       return specIds
     },
     addNum() {
       if (this.buyNum >= this.goods.stock) {
         uni.showToast({
           title: '库存不足',
           icon: 'none'
         })
         return
       }
       this.buyNum++
     },
     cutNum() {
       if (this.buyNum <= 1) return
       this.buyNum--
     },
     toSettle() {
       const params = {
         goodsId: this.goodsId,
         specId: this.hasSpec ? this.getSelectedSpecId() : null,
         quantity: this.buyNum,
         storeId: this.goods.storeId
       }
       uni.navigateTo({
         url: `/pages/order/confirm?params=${encodeURIComponent(JSON.stringify(params))}`
       })
     }
   }
 }
 </script>
 
 <style lang="scss" scoped>
 /* 淘宝闪购 1:1 */
 .flash-goods-page {
   background: #f5f5f5;
   padding-bottom: 120rpx;
 }

 .loading-container {
   display: flex;
   justify-content: center;
   align-items: center;
   min-height: 100vh;
   background: #f5f5f5;
 }
 
 /* 轮播 */
 .swiper-wrap {
   width: 100%;
   height: 700rpx;
   background: #fff;
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
   color: #ff2442;
   font-weight: bold;
 }
 .old-price {
   font-size: 26rpx;
   color: #999;
   text-decoration: line-through;
   margin-left: 16rpx;
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
     color: #ff2442;
     font-weight: bold;
     font-size: 32rpx;
   }
 }
 .btn-settle {
   width: 240rpx;
   height: 70rpx;
   background: linear-gradient(90deg, #ff2442, #ff5a3d);
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
   background: #ff2442;
   color: #fff;
   border-radius: 40rpx;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 30rpx;
 }
 </style>
