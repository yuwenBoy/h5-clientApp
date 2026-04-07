 <template>
  <view class="login-container">
    <!-- 头部 Logo -->
    <view class="login-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="app-name">闪速达</text>
      <text class="slogan">限时闪购，极速送达</text>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <!-- 手机号输入 -->
      <view class="form-item">
        <view class="input-box">
          <uni-icons type="phone" size="24" color="#999" />
          <input 
            v-model="phone" 
            type="number" 
            placeholder="请输入手机号" 
            maxlength="11"
            placeholder-class="placeholder"
          />
        </view>
      </view>

      <!-- 验证码输入 -->
      <view class="form-item">
        <view class="input-box code-box">
          <uni-icons type="code-box" size="24" color="#999" />
          <input 
            v-model="code" 
            type="number" 
            placeholder="请输入验证码" 
            maxlength="4"
            placeholder-class="placeholder"
          />
          <button 
            class="code-btn" 
            :disabled="isCounting || !isPhoneValid"
            @click="sendCode"
          >
            {{ codeBtnText }}
          </button>
        </view>
      </view>

      <!-- 登录按钮 -->
      <button 
        class="login-btn" 
        :disabled="!canLogin"
        @click="handleLogin"
      >
        登录 / 注册
      </button>

      <!-- 协议勾选 -->
      <view class="protocol">
        <checkbox-group @change="handleProtocolChange">
          <label>
            <checkbox value="1" :checked="isAgree" color="#ff6b35" style="transform:scale(0.7)" />
            <text>我已阅读并同意</text>
            <text class="link" @click.stop="viewProtocol('user')">《用户协议》</text>
            <text>和</text>
            <text class="link" @click.stop="viewProtocol('privacy')">《隐私政策》</text>
          </label>
        </checkbox-group>
      </view>
    </view>

    <!-- 其他登录方式 -->
    <view class="other-login">
      <view class="divider">其他登录方式</view>
      <view class="login-methods">
        <view class="method-item" @click="wxLogin">
          <uni-icons type="logo-weixin" size="48" color="#07C160" />
          <text>微信登录</text>
        </view>
      </view>
    </view>
  </view>
</template>
 
 <script>
 export default {
   data() {
     return {
       phone: '',           // 手机号
       code: '',            // 验证码
       isAgree: false,      // 是否同意协议
       isCounting: false,   // 是否在倒计时
       countDown: 60,       // 倒计时秒数
       timer: null          // 定时器
     };
   },
 
   computed: {
     // 手机号格式验证
     isPhoneValid() {
       return /^1[3-9]\d{9}$/.test(this.phone);
     },
     
     // 验证码按钮文本
     codeBtnText() {
       return this.isCounting ? `${this.countDown}秒后重试` : '获取验证码';
     },
     
     // 是否可以登录
     canLogin() {
       return this.isPhoneValid && /^\d{4}$/.test(this.code) && this.isAgree;
     }
   },
 
   methods: {
     // 发送验证码
     async sendCode() {
       if (!this.isPhoneValid) {
		     this.$utils.toast('请输入正确手机号')
         return false;
       }
       
       // 防止重复发送
       if (this.isCounting) return false;
       
       try {
         // 调用接口发送验证码
         const res = await this.$request.post(this.$apis.user.sendSmsCode,{ phone: this.phone })
         if (res.code === 0) {
           this.$utils.toast('验证码已发送');
           this.startCountDown();
         } else {
           this.$utils.toast('发送失败');
         }
       } catch (error) {
          this.$utils.toast(error && error.data.message || '网络错误');
       }
     },
 
     // 倒计时
     startCountDown() {
       this.isCounting = true;
       this.countDown = 60;
       this.timer = setInterval(() => {
         this.countDown--;
         if (this.countDown <= 0) {
           clearInterval(this.timer);
           this.isCounting = false;
         }
       }, 1000);
     },
 
     // 处理登录
     async handleLogin() {
       if (!this.canLogin) return;
       
       this.$utils.toast('登录中...');
       
       try {
		     const res = await this.$request.post(this.$apis.user.loginByPhone,{ phone: this.phone,code: this.code })
          if (res.code === 0) {
           // 保存 token 和用户信息
           this.$utils.setStorage('token', res.result.data.token);
           this.$utils.setStorage('userInfo', res.result.data.userInfo);
		       this.$utils.toast(res.result && res.result.msg || '网络错误');
           // 跳转首页
           setTimeout(() => {
             uni.switchTab({ url: '/pages/home/home' });
           }, 1500);
         } else {
           this.$utils.toast('登录失败');
         }
       } catch (error) {
         this.$utils.toast(error && error.data.message || '网络错误');
       } finally {
         uni.hideLoading();
       }
     },
 
     // 微信登录（小程序/App）
     async wxLogin(e) {
       // #ifdef MP-WEIXIN
       if (e.detail.errMsg === 'getPhoneNumber:ok') {
         const code = await uni.login();
         const res = await this.$api.wxLogin({
           code: code.code,
           encryptedData: e.detail.encryptedData,
           iv: e.detail.iv
         });
         
         if (res.code === 200) {
           uni.setStorageSync('token', res.data.token);
           uni.switchTab({ url: '/pages/index/index' });
         }
       }
       // #endif
     },
 
     // 协议勾选
     handleProtocolChange(e) {
       this.isAgree = e.detail.value.length > 0;
			 console.log('协议状态:', this.isAgree)
     },
 
     // 查看协议
     viewProtocol(type) {
       const url = type === 'user' 
         ? '/pages/protocol/user-agreement' 
         : '/pages/protocol/privacy-policy';
       uni.navigateTo({ url });
     }
   },
 
   onUnload() {
     // 页面卸载时清除定时器
     if (this.timer) {
       clearInterval(this.timer);
     }
   }
 };
 </script>
 
 <style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  padding: 100rpx 60rpx 40rpx;
}

// 头部
.login-header {
  text-align: center;
  margin-bottom: 80rpx;
  
  .logo {
    width: 160rpx;
    height: 160rpx;
    border-radius: 24rpx;
    box-shadow: 0 8rpx 24rpx rgba(255, 255, 255, 0.3);
    background: #fff;
    padding: 20rpx;
  }
  
  .app-name {
    display: block;
    font-size: 40rpx;
    font-weight: bold;
    color: #fff;
    margin-top: 24rpx;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
  }
  
  .slogan {
    display: block;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.9);
    margin-top: 12rpx;
  }
}

// 表单
.login-form {
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.1);
  
  .form-item {
    margin-bottom: 40rpx;
    
    .input-box {
      display: flex;
      align-items: center;
      background: #f5f5f5;
      border-radius: 12rpx;
      padding: 24rpx 28rpx;
      
      uni-icons {
        margin-right: 20rpx;
      }
      
      input {
        flex: 1;
        font-size: 30rpx;
        color: #333;
      }
      
      .placeholder {
        color: #999;
      }
    }
    
    .code-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      input {
        flex: 1;
      }
      
      .code-btn {
        margin-left: 20rpx;
        padding: 16rpx 24rpx;
        font-size: 26rpx;
        color: #ff6b35;
        background: transparent;
        border: 2rpx solid #ff6b35;
        border-radius: 12rpx;
        line-height: 1;
        
        &[disabled] {
          color: #ccc;
          border-color: #ccc;
        }
        
        &:after {
          border: none;
        }
      }
    }
  }
  
  .login-btn {
    width: 100%;
    margin-top: 40rpx;
    background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    border-radius: 50rpx;
    padding: 28rpx;
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.3);
    
    &[disabled] {
      background: #ddd;
      box-shadow: none;
    }
    
    &:after {
      border: none;
    }
  }
  
  .protocol {
    margin-top: 32rpx;
    font-size: 22rpx;
    color: #999;
    text-align: center;
    
    label {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .link {
      color: #ff6b35;
    }
  }
}

// 其他登录方式
.other-login {
  margin-top: 60rpx;
  
  .divider {
    position: relative;
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
    font-size: 24rpx;
    
    &:before,
    &:after {
      content: '';
      position: absolute;
      top: 50%;
      width: 160rpx;
      height: 2rpx;
      background: rgba(255, 255, 255, 0.3);
    }
    
    &:before {
      left: 0;
    }
    
    &:after {
      right: 0;
    }
  }
  
  .login-methods {
    display: flex;
    justify-content: center;
    margin-top: 40rpx;
    
    .method-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 40rpx;
      
      text {
        margin-top: 12rpx;
        font-size: 24rpx;
        color: #fff;
      }
    }
  }
}
</style>
