 <template>
   <view class="address-list-container">
     <!-- 新增地址按钮 -->
     <view class="add-address-btn" @click="goAddAddress">
       <text class="add-icon">+</text>
       <text class="add-text">添加新地址</text>
     </view>
 
     <!-- 地址列表 -->
     <view class="address-list" v-if="addressList.length">
       <view 
         class="address-item" 
         v-for="(item, index) in addressList" 
         :key="index"
         @click="goEditAddress(item)"
       >
         <!-- 默认地址标签 -->
         <view class="default-tag" v-if="item.isDefault">默认地址</view>
         
         <!-- 地址信息 -->
         <view class="address-info">
           <view class="name-phone">
             <text class="name">{{ item.receiver }}</text>
             <text class="phone">{{ item.phone }}</text>
           </view>
           <view class="address-detail">
             <text>{{ item.province }}{{ item.city }}{{ item.area }}{{ item.detailAddress }}</text>
           </view>
         </view>
 
         <!-- 操作按钮 -->
         <view class="address-actions">
           <text class="action-btn set-default" v-if="!item.isDefault" @click.stop="setDefaultAddress(item.id)">设为默认</text>
           <text class="action-btn edit" @click.stop="goEditAddress(item)">编辑</text>
           <text class="action-btn delete" @click.stop="deleteAddress(item.id)">删除</text>
         </view>
       </view>
     </view>
 
     <!-- 空状态 -->
     <view class="empty-address" v-else>
       <image class="empty-icon" src="/static/address-empty.png" mode="widthFix"></image>
       <text class="empty-text">暂无收货地址，添加后可快速下单</text>
       <view class="empty-add-btn" @click="goAddAddress">
         <text class="empty-add-text">立即添加</text>
       </view>
     </view>
   </view>
 </template>
 
 <script>
 export default {
   data() {
     return {
       addressList: [] // 地址列表
     };
   },
   onShow() {
     // 每次进入页面刷新地址列表
     this.getAddressList();
   },
   methods: {
     /**
      * 获取地址列表
      */
     async getAddressList() {
       try {
         const res = await this.$request.post(this.$apis.user.getAddressList);
         this.addressList = res.result || [];
       } catch (error) {
         uni.showToast({
           title: '获取地址失败',
           icon: 'none'
         });
         console.error('获取地址列表失败：', error);
       }
     },
 
     /**
      * 跳转到新增地址页
      */
     goAddAddress() {
       uni.navigateTo({
         url: '/pages/user/address/edit'
       });
     },
 
     /**
      * 跳转到编辑地址页
      */
     goEditAddress(item) {
       uni.navigateTo({
         url: `/pages/user/address/edit?addressId=${item.id}`
       });
     },
 
     /**
      * 设为默认地址
      */
     async setDefaultAddress(addressId) {
       uni.showModal({
         title: '提示',
         content: '确定将该地址设为默认地址吗？',
         success: async (res) => {
           if (res.confirm) {
             try {
               await this.$request.post(this.$apis.user.setDefaultAddress,{id:addressId});
               uni.showToast({
                 title: '设置成功',
                 icon: 'success'
               });
               // 刷新列表
               this.getAddressList();
             } catch (error) {
               uni.showToast({
                 title: '设置失败',
                 icon: 'none'
               });
             }
           }
         }
       });
     },
 
     /**
      * 删除地址
      */
     async deleteAddress(addressId) {
       uni.showModal({
         title: '提示',
         content: '确定删除该地址吗？删除后不可恢复',
         success: async (res) => {
           if (res.confirm) {
             try {
               await this.$request.post(this.$apis.user.deleteAddress,{ id: addressId})
               uni.showToast({
                 title: '删除成功',
                 icon: 'success'
               });
               // 刷新列表
               this.getAddressList();
             } catch (error) {
               uni.showToast({
                 title: '删除失败',
                 icon: 'none'
               });
             }
           }
         }
       });
     }
   }
 };
 </script>
 
 <style scoped>
/* 页面容器 */
.address-list-container {
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 添加新地址按钮 */
.add-address-btn {
  background-color: #fff;
  border: 1px dashed #ff4400;
  border-radius: 12rpx;
  padding: 30rpx;
  text-align: center;
  margin-bottom: 20rpx;
}
.add-address-btn text {
  color: #ff4400;
  font-size: 32rpx;
}

/* 地址卡片 */
.address-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  position: relative;
}
.address-card .default-tag {
  position: absolute;
  right: 30rpx;
  top: 30rpx;
  background-color: #ff4400;
  color: #fff;
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}
.address-card .name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.address-card .name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}
.address-card .phone {
  font-size: 28rpx;
  color: #666;
}
.address-card .address-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 30rpx;
}
.address-card .action-row {
  display: flex;
  justify-content: flex-end;
  gap: 40rpx;
}
.address-card .action-btn {
  font-size: 28rpx;
  color: #666;
}
.address-card .action-btn:last-child {
  color: #ff4400;
}
 
 /* 新增地址按钮 */
 .add-address-btn {
   display: flex;
   align-items: center;
   justify-content: center;
   height: 100rpx;
   background-color: #fff;
   margin: 20rpx;
   border-radius: 16rpx;
   border: 2rpx dashed #ccc;
 }
 .add-icon {
   font-size: 40rpx;
   color: #ff4400;
   margin-right: 10rpx;
 }
 .add-text {
   font-size: 30rpx;
   color: #ff4400;
 }
 
 /* 地址列表 */
 .address-list {
   margin: 0 20rpx;
 }
 .address-item {
   background-color: #fff;
   border-radius: 16rpx;
   padding: 30rpx;
   margin-bottom: 20rpx;
   position: relative;
 }
 /* 默认标签 */
 .default-tag {
   position: absolute;
   top: 60rpx;
   right: 30rpx;
   background-color: #ff4400;
   color: #fff;
   font-size: 24rpx;
   padding: 4rpx 16rpx;
   border-radius: 20rpx;
 }
 /* 地址信息 */
 .address-info {
   margin-bottom: 20rpx;
 }
 .name-phone {
   display: flex;
   justify-content: space-between;
   margin-bottom: 10rpx;
 }
 .name {
   font-size: 30rpx;
   color: #333;
   font-weight: 500;
 }
 .phone {
   font-size: 30rpx;
   color: #666;
 }
 .address-detail {
   font-size: 28rpx;
   color: #666;
   line-height: 1.4;
 }
 /* 操作按钮 */
 .address-actions {
   display: flex;
   justify-content: flex-end;
   gap: 30rpx;
 }
 .action-btn {
   font-size: 28rpx;
 }
 .set-default {
   color: #ff4400;
 }
 .edit {
   color: #666;
 }
 .delete {
   color: #ff4400;
 }
 
 /* 空状态 */
 .empty-address {
   display: flex;
   flex-direction: column;
   align-items: center;
   padding-top: 120rpx;
 }
 .empty-icon {
   width: 240rpx;
   margin-bottom: 40rpx;
 }
 .empty-text {
   font-size: 28rpx;
   color: #999;
   margin-bottom: 60rpx;
 }
 .empty-add-btn {
   width: 240rpx;
   height: 72rpx;
   line-height: 72rpx;
   background-color: #ff4400;
   color: #fff;
   text-align: center;
   border-radius: 36rpx;
 }
 .empty-add-text {
   font-size: 28rpx;
 }
 </style>