 <!-- pages/order/confirm.vue -->
 <template>
   <view class="confirm-page">
     <!-- 1. 地址栏 -->
     <view class="address-section" @click="selectAddress">
       <view class="address-bg"></view>
       <view class="address-content" v-if="defaultAddress">
         <view class="address-top">
           <text class="address-tag">家</text>
           <text class="address-detail">{{ defaultAddress.detail }}</text>
         </view>
         <view class="address-bottom">
           <text class="name">{{ defaultAddress.name }}</text>
           <text class="phone">{{ defaultAddress.phone }}</text>
         </view>
       </view>
       <view class="address-empty" v-else>
         <text class="add-icon">+</text>
         <text class="add-text">添加收货地址</text>
       </view>
       <uni-icons type="right" size="14" color="#999" class="arrow" />
     </view>
 
     <!-- 2. 送达时间 -->
     <view class="time-section" @click="selectTime">
       <view class="time-left">
         <text class="label">送达时间</text>
         <text class="value" :class="{ fast: selectedTime.isFast }">
           {{ selectedTime.text }}
         </text>
       </view>
       <view class="time-right">
         <text class="sub-text">{{ selectedTime.subText }}</text>
         <uni-icons type="right" size="14" color="#999" />
       </view>
     </view>
 
     <!-- 3. 商品列表 -->
     <view class="goods-section">
       <view class="store-header">
         <image class="store-icon" :src="storeInfo.logo" />
         <text class="store-name">{{ storeInfo.name }}</text>
       </view>
       
       <view class="goods-list">
         <view class="goods-item" v-for="(item, index) in cartList" :key="index">
           <image class="goods-img" :src="item.img" mode="aspectFill" />
           <view class="goods-info">
             <text class="goods-name">{{ item.name }}</text>
             <text class="goods-sku" v-if="item.sku">{{ item.sku }}</text>
             <view class="goods-bottom">
               <text class="goods-price">¥{{ item.price }}</text>
               <text class="goods-count">x{{ item.count }}</text>
             </view>
           </view>
         </view>
       </view>
 
       <!-- 费用明细 -->
       <view class="fee-list">
         <view class="fee-item">
           <text class="fee-label">商品总价</text>
           <text class="fee-value">¥{{ goodsTotal }}</text>
         </view>
         <view class="fee-item">
           <text class="fee-label">配送费</text>
           <text class="fee-value" :class="{ free: deliveryFee === 0 }">
             {{ deliveryFee === 0 ? '免配送费' : '¥' + deliveryFee }}
           </text>
         </view>
         <view class="fee-item" v-if="discount > 0">
           <text class="fee-label">店铺优惠</text>
           <text class="fee-value discount">-¥{{ discount }}</text>
         </view>
         <view class="fee-item" v-if="couponDiscount > 0">
           <text class="fee-label">红包/券</text>
           <text class="fee-value discount">-¥{{ couponDiscount }}</text>
         </view>
       </view>
 
       <view class="total-row">
         <text class="total-label">合计</text>
         <text class="total-price">¥{{ finalTotal }}</text>
       </view>
     </view>
 
     <!-- 4. 备注 -->
     <view class="remark-section" @click="editRemark">
       <text class="label">订单备注</text>
       <view class="remark-content">
         <text class="remark-text" :class="{ empty: !remark }">
           {{ remark || '口味、偏好等要求' }}
         </text>
         <uni-icons type="right" size="14" color="#999" />
       </view>
     </view>
 
     <!-- 5. 支付方式 -->
     <view class="pay-section">
       <view class="pay-title">支付方式</view>
       <view class="pay-options">
         <view 
           class="pay-item" 
           :class="{ active: payMethod === 'wechat' }"
           @click="payMethod = 'wechat'"
         >
           <image class="pay-icon" src="/static/img/wechat-pay.png" />
           <text class="pay-name">微信支付</text>
           <view class="pay-check">
             <view class="check-circle" v-if="payMethod === 'wechat'"></view>
           </view>
         </view>
         <view 
           class="pay-item" 
           :class="{ active: payMethod === 'alipay' }"
           @click="payMethod = 'alipay'"
         >
           <image class="pay-icon" src="/static/img/alipay.png" />
           <text class="pay-name">支付宝</text>
           <view class="pay-check">
             <view class="check-circle" v-if="payMethod === 'alipay'"></view>
           </view>
         </view>
       </view>
     </view>
 
     <!-- 底部占位 -->
     <view class="bottom-placeholder"></view>
 
     <!-- 6. 底部固定栏 -->
     <view class="submit-bar">
       <view class="submit-content">
         <view class="price-wrap">
           <view class="price-row">
             <text class="total-label">合计</text>
             <text class="price-symbol">¥</text>
             <text class="price-value">{{ finalTotal }}</text>
           </view>
           <view class="discount-row" v-if="discount > 0 || couponDiscount > 0">
             <text class="discount-text">已优惠¥{{ (discount + couponDiscount).toFixed(1) }}</text>
             <text class="count-text">共{{ cartCount }}件</text>
           </view>
           <view class="count-row" v-else>
             <text class="count-text">共{{ cartCount }}件</text>
           </view>
         </view>
         <button 
           class="submit-btn" 
           :class="{ disabled: !canSubmit }"
           :disabled="!canSubmit"
           @click="submitOrder"
         >
           {{ submitBtnText }}
         </button>
       </view>
     </view>
 
     <!-- 送达时间弹窗 -->
     <uni-popup ref="timePopup" type="bottom">
       <view class="time-popup">
         <view class="popup-header">
           <text>选择送达时间</text>
           <uni-icons type="closeempty" size="18" color="#999" @click="$refs.timePopup.close()" />
         </view>
         <view class="time-list">
           <view 
             class="time-item" 
             v-for="(time, index) in timeOptions" 
             :key="index"
             :class="{ active: selectedTime.value === time.value }"
             @click="selectTimeOption(time)"
           >
             <text class="time-text">{{ time.text }}</text>
             <text class="time-sub">{{ time.subText }}</text>
             <uni-icons v-if="selectedTime.value === time.value" type="checkmarkempty" size="18" color="#ff6b35" />
           </view>
         </view>
       </view>
     </uni-popup>
 
     <!-- 备注弹窗 -->
     <uni-popup ref="remarkPopup" type="center">
       <view class="remark-popup">
         <view class="popup-title">订单备注</view>
         <textarea 
           class="remark-input" 
           v-model="tempRemark" 
           placeholder="请输入口味、偏好等要求"
           maxlength="100"
         />
         <view class="popup-btns">
           <button class="btn-cancel" @click="$refs.remarkPopup.close()">取消</button>
           <button class="btn-confirm" @click="confirmRemark">确定</button>
         </view>
       </view>
     </uni-popup>
   </view>
 </template>
 
 <script>
 export default {
   data() {
     return {
       defaultAddress: {
         name: '张三',
         phone: '138****8888',
         detail: '北京市朝阳区建国路88号SOHO现代城A座1201室'
       },
       
       selectedTime: {
         value: 'fast',
         text: '尽快送达',
         subText: '预计30分钟',
         isFast: true
       },
       timeOptions: [
         { value: 'fast', text: '尽快送达', subText: '预计30分钟', isFast: true },
         { value: '12:00', text: '12:00', subText: '准时达' },
         { value: '12:30', text: '12:30', subText: '准时达' },
         { value: '13:00', text: '13:00', subText: '准时达' },
         { value: '13:30', text: '13:30', subText: '准时达' },
         { value: '14:00', text: '14:00', subText: '准时达' }
       ],
       
       storeInfo: {
         name: '肯德基宅急送（朝阳大悦城店）',
         logo: 'https://picsum.photos/60/60?random=20'
       },
       
       cartList: [
         { name: '香辣鸡腿堡套餐', price: 29.9, count: 2, img: 'https://picsum.photos/120/120?random=1', sku: '中薯条+中可乐' },
         { name: '新奥尔良烤翅（4块）', price: 19.9, count: 1, img: 'https://picsum.photos/120/120?random=3' },
         { name: '葡式蛋挞（6只）', price: 25, count: 1, img: 'https://picsum.photos/120/120?random=4' }
       ],
       
       deliveryFee: 5,
       discount: 5,
       couponDiscount: 2,
       
       remark: '',
       tempRemark: '',
       
       payMethod: 'wechat',
       
       minOrderAmount: 30
     }
   },
   
   computed: {
     goodsTotal() {
       return this.cartList.reduce((sum, item) => sum + item.price * item.count, 0).toFixed(1)
     },
     
     cartCount() {
       return this.cartList.reduce((sum, item) => sum + item.count, 0)
     },
     
     finalTotal() {
       const total = parseFloat(this.goodsTotal) + this.deliveryFee - this.discount - this.couponDiscount
       return total.toFixed(1)
     },
     
     canSubmit() {
       return parseFloat(this.finalTotal) >= this.minOrderAmount && this.defaultAddress
     },
     
     submitBtnText() {
       if (!this.defaultAddress) return '请选择地址'
       if (parseFloat(this.finalTotal) < this.minOrderAmount) {
         return `差¥${(this.minOrderAmount - parseFloat(this.finalTotal)).toFixed(1)}起送`
       }
       return '提交订单'
     }
   },
   
   methods: {
     selectAddress() {
       uni.navigateTo({ url: '/pages/address/list?select=true' })
     },
     
     selectTime() {
       this.$refs.timePopup.open()
     },
     
     selectTimeOption(time) {
       this.selectedTime = time
       this.$refs.timePopup.close()
     },
     
     editRemark() {
       this.tempRemark = this.remark
       this.$refs.remarkPopup.open()
     },
     
     confirmRemark() {
       this.remark = this.tempRemark
       this.$refs.remarkPopup.close()
     },
     
     submitOrder() {
       if (!this.canSubmit) return
       
       const orderData = {
         address: this.defaultAddress,
         deliveryTime: this.selectedTime,
         storeId: this.storeInfo.id,
         goods: this.cartList,
         remark: this.remark,
         payMethod: this.payMethod,
         totalAmount: this.finalTotal
       }
       
       this.$request.post(this.$apis.order.create, orderData).then(res => {
         this.requestPayment(res.result)
       }).catch(err => {
         uni.showToast({ title: '创建订单失败', icon: 'none' })
       })
     },
     
     requestPayment(orderInfo) {
       uni.requestPayment({
         provider: this.payMethod === 'wechat' ? 'wxpay' : 'alipay',
         orderInfo: orderInfo,
         success: () => {
           uni.showToast({ title: '支付成功' })
           setTimeout(() => {
             uni.redirectTo({ url: '/pages/order/success?orderId=' + orderInfo.id })
           }, 1500)
         },
         fail: () => {
           uni.showToast({ title: '支付取消', icon: 'none' })
         }
       })
     }
   }
 }
 </script>
 
 <style lang="scss" scoped>
 $primary: #ff6b35;
 
 .confirm-page {
   min-height: 100vh;
   background: #f5f5f5;
   padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
 }
 
 // 1. 地址栏
 .address-section {
   position: relative;
   background: #fff;
   padding: 30rpx;
   margin-bottom: 20rpx;
   
   .address-bg {
     position: absolute;
     top: 0;
     left: 0;
     right: 0;
     height: 6rpx;
     background: repeating-linear-gradient(
       45deg,
       $primary,
       $primary 10rpx,
       #fff 10rpx,
       #fff 20rpx,
       #5ac8fa 20rpx,
       #5ac8fa 30rpx,
       #fff 30rpx,
       #fff 40rpx
     );
   }
   
   .address-content {
     .address-top {
       display: flex;
       align-items: center;
       margin-bottom: 16rpx;
       
       .address-tag {
         padding: 4rpx 12rpx;
         background: $primary;
         color: #fff;
         font-size: 22rpx;
         border-radius: 6rpx;
         margin-right: 16rpx;
       }
       
       .address-detail {
         flex: 1;
         font-size: 32rpx;
         font-weight: bold;
         color: #333;
         line-height: 1.4;
       }
     }
     
     .address-bottom {
       padding-left: 68rpx;
       
       .name, .phone {
         font-size: 28rpx;
         color: #666;
         margin-right: 20rpx;
       }
     }
   }
   
   .address-empty {
     display: flex;
     align-items: center;
     justify-content: center;
     padding: 40rpx;
     
     .add-icon {
       width: 48rpx;
       height: 48rpx;
       background: $primary;
       color: #fff;
       font-size: 32rpx;
       border-radius: 50%;
       display: flex;
       align-items: center;
       justify-content: center;
       margin-right: 16rpx;
     }
     
     .add-text {
       font-size: 30rpx;
       color: $primary;
     }
   }
   
   .arrow {
     position: absolute;
     right: 30rpx;
     top: 50%;
     transform: translateY(-50%);
   }
 }
 
 // 2. 送达时间
 .time-section {
   display: flex;
   justify-content: space-between;
   align-items: center;
   background: #fff;
   padding: 30rpx;
   margin-bottom: 20rpx;
   
   .time-left {
     display: flex;
     align-items: center;
     
     .label {
       font-size: 28rpx;
       color: #333;
       margin-right: 20rpx;
     }
     
     .value {
       font-size: 28rpx;
       color: #333;
       font-weight: bold;
       
       &.fast {
         color: $primary;
       }
     }
   }
   
   .time-right {
     display: flex;
     align-items: center;
     
     .sub-text {
       font-size: 26rpx;
       color: #999;
       margin-right: 10rpx;
     }
   }
 }
 
 // 3. 商品区域
 .goods-section {
   background: #fff;
   padding: 30rpx;
   margin-bottom: 20rpx;
   
   .store-header {
     display: flex;
     align-items: center;
     padding-bottom: 20rpx;
     border-bottom: 1rpx solid #f0f0f0;
     margin-bottom: 20rpx;
     
     .store-icon {
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
   
   .goods-list {
     .goods-item {
       display: flex;
       padding: 20rpx 0;
       
       .goods-img {
         width: 120rpx;
         height: 120rpx;
         border-radius: 8rpx;
         margin-right: 20rpx;
       }
       
       .goods-info {
         flex: 1;
         display: flex;
         flex-direction: column;
         justify-content: space-between;
         
         .goods-name {
           font-size: 28rpx;
           color: #333;
           line-height: 1.4;
         }
         
         .goods-sku {
           font-size: 24rpx;
           color: #999;
         }
         
         .goods-bottom {
           display: flex;
           justify-content: space-between;
           align-items: center;
           
           .goods-price {
             font-size: 28rpx;
             color: #333;
             font-weight: bold;
           }
           
           .goods-count {
             font-size: 26rpx;
             color: #999;
           }
         }
       }
     }
   }
   
   .fee-list {
     margin-top: 20rpx;
     padding-top: 20rpx;
     border-top: 1rpx dashed #e0e0e0;
     
     .fee-item {
       display: flex;
       justify-content: space-between;
       margin-bottom: 16rpx;
       
       .fee-label {
         font-size: 26rpx;
         color: #666;
       }
       
       .fee-value {
         font-size: 26rpx;
         color: #333;
         
         &.free, &.discount {
           color: $primary;
         }
       }
     }
   }
   
   .total-row {
     display: flex;
     justify-content: flex-end;
     align-items: center;
     margin-top: 20rpx;
     padding-top: 20rpx;
     border-top: 1rpx solid #f0f0f0;
     
     .total-label {
       font-size: 26rpx;
       color: #666;
       margin-right: 20rpx;
     }
     
     .total-price {
       font-size: 36rpx;
       color: $primary;
       font-weight: bold;
     }
   }
 }
 
 // 4. 备注
 .remark-section {
   display: flex;
   justify-content: space-between;
   align-items: center;
   background: #fff;
   padding: 30rpx;
   margin-bottom: 20rpx;
   
   .label {
     font-size: 28rpx;
     color: #333;
   }
   
   .remark-content {
     display: flex;
     align-items: center;
     flex: 1;
     margin-left: 20rpx;
     justify-content: flex-end;
     
     .remark-text {
       font-size: 26rpx;
       color: #333;
       max-width: 400rpx;
       overflow: hidden;
       text-overflow: ellipsis;
       white-space: nowrap;
       margin-right: 10rpx;
       
       &.empty {
         color: #999;
       }
     }
   }
 }
 
 // 5. 支付方式
 .pay-section {
   background: #fff;
   padding: 30rpx;
   margin-bottom: 20rpx;
   
   .pay-title {
     font-size: 28rpx;
     color: #333;
     font-weight: bold;
     margin-bottom: 20rpx;
   }
   
   .pay-options {
     .pay-item {
       display: flex;
       align-items: center;
       padding: 20rpx 0;
       border-bottom: 1rpx solid #f5f5f5;
       
       &:last-child {
         border-bottom: none;
       }
       
       &.active {
         .pay-name {
           color: $primary;
         }
       }
       
       .pay-icon {
         width: 48rpx;
         height: 48rpx;
         margin-right: 20rpx;
       }
       
       .pay-name {
         flex: 1;
         font-size: 28rpx;
         color: #333;
       }
       
       .pay-check {
         width: 36rpx;
         height: 36rpx;
         border: 2rpx solid #ccc;
         border-radius: 50%;
         display: flex;
         align-items: center;
         justify-content: center;
         
         .check-circle {
           width: 20rpx;
           height: 20rpx;
           background: $primary;
           border-radius: 50%;
         }
       }
     }
   }
 }
 
 // 底部占位
 .bottom-placeholder {
   height: 140rpx;
 }
 
 // 6. 底部固定栏（优化版）
 .submit-bar {
   position: fixed;
   left: 0;
   right: 0;
   bottom: 0;
   background: #fff;
   z-index: 100;
   padding-bottom: env(safe-area-inset-bottom);
   border-top: 1rpx solid #e5e5e5;
   
   .submit-content {
     display: flex;
     justify-content: space-between;
     align-items: center;
     padding: 16rpx 24rpx;
     height: 100rpx;
     box-sizing: border-box;
   }
   
   .price-wrap {
     flex: 1;
     display: flex;
     flex-direction: column;
     justify-content: center;
     
     .price-row {
       display: flex;
       align-items: baseline;
       
       .total-label {
         font-size: 24rpx;
         color: #666;
         margin-right: 8rpx;
       }
       
       .price-symbol {
         font-size: 20rpx;
         color: $primary;
         font-weight: bold;
       }
       
       .price-value {
         font-size: 36rpx;
         color: $primary;
         font-weight: bold;
         line-height: 1;
       }
     }
     
     .discount-row, .count-row {
       display: flex;
       align-items: center;
       margin-top: 4rpx;
       gap: 16rpx;
       
       text {
         font-size: 20rpx;
         color: #999;
       }
     }
   }
   
   .submit-btn {
     min-width: 180rpx;
     height: 72rpx;
     padding: 0 32rpx;
     margin: 0;
     margin-left: 20rpx;
     background: $primary;
     color: #fff;
     font-size: 28rpx;
     font-weight: bold;
     border-radius: 36rpx;
     border: none;
     display: flex;
     align-items: center;
     justify-content: center;
     flex-shrink: 0;
     white-space: nowrap;
     
     &.disabled {
       background: #ccc;
     }
     
     &:active {
       opacity: 0.9;
     }
   }
 }
 
 // 弹窗样式
 .time-popup {
   background: #fff;
   border-radius: 20rpx 20rpx 0 0;
   padding: 30rpx;
   
   .popup-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 30rpx;
     
     text {
       font-size: 32rpx;
       font-weight: bold;
       color: #333;
     }
   }
   
   .time-list {
     max-height: 600rpx;
     overflow-y: auto;
     
     .time-item {
       display: flex;
       align-items: center;
       padding: 30rpx 0;
       border-bottom: 1rpx solid #f5f5f5;
       
       &.active {
         .time-text {
           color: $primary;
         }
       }
       
       .time-text {
         font-size: 30rpx;
         color: #333;
         margin-right: 20rpx;
       }
       
       .time-sub {
         flex: 1;
         font-size: 26rpx;
         color: #999;
       }
     }
   }
 }
 
 .remark-popup {
   background: #fff;
   border-radius: 20rpx;
   padding: 40rpx;
   width: 600rpx;
   
   .popup-title {
     font-size: 32rpx;
     font-weight: bold;
     color: #333;
     text-align: center;
     margin-bottom: 30rpx;
   }
   
   .remark-input {
     width: 100%;
     height: 200rpx;
     background: #f5f5f5;
     border-radius: 12rpx;
     padding: 20rpx;
     font-size: 28rpx;
     color: #333;
     box-sizing: border-box;
   }
   
   .popup-btns {
     display: flex;
     justify-content: space-between;
     margin-top: 30rpx;
     
     button {
       flex: 1;
       margin: 0 10rpx;
       padding: 20rpx 0;
       font-size: 28rpx;
       border-radius: 8rpx;
       border: none;
       
       &.btn-cancel {
         background: #f5f5f5;
         color: #666;
       }
       
       &.btn-confirm {
         background: $primary;
         color: #fff;
       }
     }
   }
 }
 </style>
