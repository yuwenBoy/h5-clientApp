<template>
  <view class="address-edit-container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <text class="nav-back" @click="goBack">←</text>
      <text class="nav-title">{{ isEdit ? '编辑地址' : '新增地址' }}</text>
      <text class="nav-save" @click="saveAddress">保存</text>
    </view>

    <!-- 表单内容 -->
    <scroll-view class="form-scroll" scroll-y>
      <view class="form-item">
        <text class="form-label">收货人</text>
        <input 
          class="form-input" 
          type="text" 
          v-model="form.receiver" 
          placeholder="请输入收货人姓名"
        />
      </view>

      <view class="form-item">
        <text class="form-label">手机号</text>
        <input 
          class="form-input" 
          type="number" 
          v-model="form.phone" 
          placeholder="请输入手机号"
          maxlength="11"
        />
      </view>

      <!-- 自定义省市区三级联动选择器（核心改造） -->
      <view class="form-item">
        <text class="form-label">所在地区</text>
        <view class="region-selector" @click="openRegionPicker">
          <text class="picker-text">
            {{ form.province || '请选择省' }} {{ form.city || '请选择市' }} {{ form.area || '请选择区' }}
          </text>
        </view>
      </view>

      <!-- 省市区选择弹窗（底部弹出） -->
      <uni-popup ref="regionPopup" type="bottom" :mask-click="false">
        <view class="picker-popup">
          <view class="popup-header">
            <text class="popup-cancel" @click="closeRegionPicker">取消</text>
            <text class="popup-confirm" @click="confirmRegion">确认</text>
          </view>
          <picker-view 
            class="picker-view" 
            :value="pickerValue" 
            @change="onPickerChange"
          >
            <picker-view-column>
              <view class="picker-item" v-for="(item, index) in provinceList" :key="item.id">
                {{ item.fullName }}
              </view>
            </picker-view-column>
            <picker-view-column>
              <view class="picker-item" v-for="(item, index) in cityList" :key="item.id">
                {{ item.fullName }}
              </view>
            </picker-view-column>
            <picker-view-column>
              <view class="picker-item" v-for="(item, index) in areaList" :key="item.id">
                {{ item.name }}
              </view>
            </picker-view-column>
          </picker-view>
        </view>
      </uni-popup>

      <view class="form-item">
        <text class="form-label">详细地址</text>
        <textarea 
          class="form-textarea" 
          v-model="form.detailAddress" 
          placeholder="请输入详细地址（如街道、小区、门牌号等）"
        ></textarea>
      </view>

      <!-- 设为默认地址 -->
      <view class="form-item default-item" @click="toggleDefault">
        <text class="form-label">默认地址</text>
        <switch 
          :checked="form.isDefault" 
          @change="toggleDefault"
        />
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isEdit: false, // 是否编辑模式
      addressId: '', // 地址ID
      form: {
        receiver: '', // 收货人
        phone: '', // 手机号
        province: '', // 省名称
        provinceId: '', // 省ID（对接后端）
        city: '', // 市名称
        cityId: '', // 市ID（对接后端）
        area: '', // 区/县名称
        areaId: '', // 区/县ID（对接后端）
        detailAddress: '', // 详细地址
        isDefault: "0" // 是否默认地址
      },
      // 地区选择器相关
      provinceList: [], // 省级列表（从后端拉取）
      cityList: [], // 市级列表
      areaList: [], // 区级列表
      pickerValue: [0, 0, 0], // 选择器选中索引 [省, 市, 区]
      currentProvince: {}, // 当前选中的省
      currentCity: {}, // 当前选中的市
      currentArea: {} // 当前选中的区
    };
  },
  onLoad(options) {
    // 初始化加载省级数据
    this.loadProvinceList();
    
    // 判断是否编辑模式
    if (options.addressId) {
      this.isEdit = true;
      this.addressId = options.addressId;
      this.getAddressDetail();
    }
  },
  methods: {
    /**
     * 返回上一页
     */
    goBack() {
			 uni.redirectTo({ url: '/pages/user/address/list' });
    },

    /**
     * 加载省级列表（从后端接口拉取）
     */
    async loadProvinceList() {
      try {
        // 修复1：参数拼写错误 leval → level
        const res = await this.$request.post(this.$apis.common.chinaRegions, { level: 1 });
        // 修复2：正确提取接口数据（res.data.result）
        const responseData = res.result || res;
        this.provinceList = responseData || [];
        
        console.log('省级列表：', this.provinceList);
        
        if (this.provinceList.length > 0) {
          // 默认选中第一个省，加载对应市
          this.currentProvince = this.provinceList[0];
          this.loadCityList(this.currentProvince.id);
        }
      } catch (error) {
        uni.showToast({ title: '加载地区数据失败', icon: 'none' });
        console.error('加载省份失败：', error);
      }
    },

    /**
     * 加载市级列表
     * @param {String} provinceId 省份ID
     */
    async loadCityList(provinceId) {
      try {
        // 修复3：统一用 chinaRegions 接口，参数 level=2
        const res = await this.$request.post(this.$apis.common.chinaRegions, { 
          parentId: provinceId, 
          level: 2 
        });
        const responseData = res.data || res;
        this.cityList = responseData.result || [];
        
        console.log('市级列表：', this.cityList);
        
        if (this.cityList.length > 0) {
          // 默认选中第一个市，加载对应区
          this.currentCity = this.cityList[0];
          this.loadAreaList(this.currentCity.id);
        } else {
          this.cityList = [];
          this.areaList = [];
        }
      } catch (error) {
        console.error('加载城市失败：', error);
      }
    },

    /**
     * 加载区级列表
     * @param {String} cityId 城市ID
     */
    async loadAreaList(cityId) {
      try {
        // 修复4：区级也用 chinaRegions 接口，替换原来的 getAreaList
        const res = await this.$request.post(this.$apis.common.chinaRegions, { 
          parentId: cityId, 
          level: 3 
        });
        const responseData = res.data || res;
        this.areaList = responseData.result || [];
        
        console.log('区级列表：', this.areaList);
        
        if (this.areaList.length > 0) {
          this.currentArea = this.areaList[0];
        } else {
          this.areaList = [];
        }
      } catch (error) {
        console.error('加载区县失败：', error);
      }
    },

    /**
     * 打开省市区选择弹窗
     */
    openRegionPicker() {
      this.$refs.regionPopup.open();
    },

    /**
     * 关闭省市区选择弹窗
     */
    closeRegionPicker() {
      this.$refs.regionPopup.close();
    },

    /**
     * 选择器值变化（联动逻辑）
     */
    async onPickerChange(e) {
      const [provinceIndex, cityIndex, areaIndex] = e.detail.value;
      
      // 修复5：先保存原始索引，避免联动时重复触发
      const oldProvinceIndex = this.pickerValue[0];
      const oldCityIndex = this.pickerValue[1];
      
      // 1. 省切换
      if (provinceIndex !== oldProvinceIndex) {
        this.currentProvince = this.provinceList[provinceIndex] || {};
        await this.loadCityList(this.currentProvince.id);
        // 重置市、区索引
        this.pickerValue = [provinceIndex, 0, 0];
        this.currentCity = this.cityList[0] || {};
        if (this.currentCity.id) {
          await this.loadAreaList(this.currentCity.id);
          this.currentArea = this.areaList[0] || {};
        }
      } 
      // 2. 市切换
      else if (cityIndex !== oldCityIndex) {
        this.currentCity = this.cityList[cityIndex] || {};
        if (this.currentCity.id) {
          await this.loadAreaList(this.currentCity.id);
          // 重置区索引
          this.pickerValue = [provinceIndex, cityIndex, 0];
          this.currentArea = this.areaList[0] || {};
        }
      } 
      // 3. 区切换
      else {
        this.currentArea = this.areaList[areaIndex] || {};
        this.pickerValue = [provinceIndex, cityIndex, areaIndex];
      }
    },

    /**
     * 确认选择省市区
     */
    confirmRegion() {
      // 填充表单（名称+ID）
      this.form.province = this.currentProvince.name || '';
      this.form.provinceId = this.currentProvince.id || '';
      this.form.city = this.currentCity.name || '';
      this.form.cityId = this.currentCity.id || '';
      this.form.area = this.currentArea.name || '';
      this.form.areaId = this.currentArea.id || '';
      
      this.closeRegionPicker();
    },

    /**
     * 获取地址详情（编辑模式）
     */
    async getAddressDetail() {
      try {
        const res = await this.$request.post(this.$apis.user.getAddressDetail, { 
          id: this.addressId 
        });
        const responseData = res.data || res;
        const data = responseData.result || {};
        
        // 填充基础表单
        this.form = {
          receiver: data.receiver || '',
          phone: data.phone || '',
          province: data.province || '', // 省名称
          provinceId: data.provinceId || '', // 省ID
          city: data.city || '', // 市名称
          cityId: data.cityId || '', // 市ID
          area: data.area || '', // 区名称
          areaId: data.areaId || '', // 区ID
          detailAddress: data.detailAddress || '',
          isDefault: data.isDefault == 1
        };

        // 编辑模式：回显省市区选择器
        if (this.form.provinceId) {
          // 1. 找到省份索引
          const provinceIndex = this.provinceList.findIndex(item => item.id === this.form.provinceId);
          if (provinceIndex > -1) {
            this.pickerValue[0] = provinceIndex;
            this.currentProvince = this.provinceList[provinceIndex];
            // 2. 加载对应市
            await this.loadCityList(this.form.provinceId);
            // 3. 找到城市索引
            const cityIndex = this.cityList.findIndex(item => item.id === this.form.cityId);
            if (cityIndex > -1) {
              this.pickerValue[1] = cityIndex;
              this.currentCity = this.cityList[cityIndex];
              // 4. 加载对应区
              await this.loadAreaList(this.form.cityId);
              // 5. 找到区县索引
              const areaIndex = this.areaList.findIndex(item => item.id === this.form.areaId);
              if (areaIndex > -1) {
                this.pickerValue[2] = areaIndex;
                this.currentArea = this.areaList[areaIndex];
              }
            }
          }
        }
      } catch (error) {
        uni.showToast({
          title: '获取地址详情失败',
          icon: 'none'
        });
        console.error('获取地址详情失败：', error);
      }
    },

    /**
     * 切换默认地址
     */
    toggleDefault(e) {
			this.form.isDefault = e.detail.value ? "1" :"0"
			console.log(this.form.isDefault)
    },

    /**
     * 表单校验（新增地区ID校验）
     */
    validateForm() {
      if (!this.form.receiver) {
        uni.showToast({ title: '请输入收货人姓名', icon: 'none' });
        return false;
      }
      if (!/^1[3-9]\d{9}$/.test(this.form.phone)) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
        return false;
      }
      // 新增：校验地区ID/名称
      if (!this.form.provinceId || !this.form.cityId || !this.form.areaId) {
        uni.showToast({ title: '请选择所在地区', icon: 'none' });
        return false;
      }
      if (!this.form.detailAddress) {
        uni.showToast({ title: '请输入详细地址', icon: 'none' });
        return false;
      }
      return true;
    },

    /**
     * 保存地址
     */
    async saveAddress() {
      // 表单校验
      if (!this.validateForm()) return;

      try {
        let res;
        const submitData = { ...this.form };
        
        if (this.isEdit) {
          // 编辑地址：携带ID+地区ID
          submitData.id = this.addressId;
          res = await this.$request.post(this.$apis.user.editAddress, submitData);
        } else {
          // 新增地址：携带地区ID
          res = await this.$request.post(this.$apis.user.addAddress, submitData);
        }

        const responseData = res.data || res;
        if (responseData.success) {
          uni.showToast({
            title: this.isEdit ? '修改成功' : '添加成功',
            icon: 'success'
          });

          // 返回地址列表页
          setTimeout(() => {
             this.goBack()
          }, 1500);
        } else {
          uni.showToast({
            title: responseData.message || (this.isEdit ? '修改失败' : '添加失败'),
            icon: 'none'
          });
        }
      } catch (error) {
        uni.showToast({
          title: this.isEdit ? '修改失败' : '添加失败',
          icon: 'none'
        });
        console.error('保存地址失败：', error);
      }
    }
  }
}
</script>

<style scoped>
.address-edit-container {
  background-color: #fff;
  min-height: 100vh;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  border-bottom: 2rpx solid #eee;
}
.nav-back {
  font-size: 36rpx;
  color: #333;
}
.nav-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}
.nav-save {
  font-size: 30rpx;
  color: #ff4400;
}

/* 表单滚动区 */
.form-scroll {
  height: calc(100vh - 88rpx);
}

/* 表单项 */
.form-item {
  padding: 30rpx;
  border-bottom: 2rpx solid #f5f5f5;
  display: flex;
  flex-direction: column;
}
.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}
.form-input {
  font-size: 30rpx;
  color: #666;
  height: 40rpx;
  line-height: 40rpx;
}
.form-textarea {
  font-size: 30rpx;
  color: #666;
  min-height: 160rpx;
  line-height: 1.4;
}

/* 地区选择器 */
.region-selector {
  width: 100%;
  padding: 10rpx 0;
}
.picker-text {
  font-size: 30rpx;
  color: #666;
}
 /* 省市区选择弹窗 */
 .picker-popup {
   width: 100%;
   background-color: #fff;
   border-radius: 20rpx 20rpx 0 0;
 }
 .popup-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 20rpx 30rpx;
   border-bottom: 2rpx solid #eee;
 }
 .popup-cancel {
   font-size: 28rpx;
   color: #999;
 }
 .popup-confirm {
   font-size: 28rpx;
   color: #ff4400;
 }
 .picker-view {
   width: 100%;
   height: 440px; /* 压缩整体高度 */
 }
 .picker-item {
   line-height: 46rpx; /* 压缩行高，减少上下padding */
   padding: 4rpx 0;
   text-align: center;
   font-size: 30rpx;
   color: #333;
 }

/* 默认地址项 */
.default-item {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
</style>