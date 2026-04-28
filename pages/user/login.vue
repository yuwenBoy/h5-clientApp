<template>
  <view class="login-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="circle circle-1"></view>
      <view class="circle circle-2"></view>
      <view class="circle circle-3"></view>
    </view>
    
    <!-- 返回按钮 -->
    <view class="back-btn" @click="goBack">
      <uni-icons type="left" size="24" color="#333"></uni-icons>
    </view>

    <!-- 主要内容区 -->
    <view class="content-wrapper">
      <!-- 欢迎文字 -->
      <view class="welcome-section">
        <text class="welcome-title">欢迎回来</text>
        <text class="welcome-subtitle">请登录您的账号</text>
      </view>

      <!-- 登录表单卡片 -->
      <view class="form-card">
        <!-- 手机号输入 -->
        <view class="input-group">
          <view class="input-icon">
            <uni-icons type="phone-filled" size="20" color="#999"></uni-icons>
          </view>
          <input 
            v-model="phone" 
            type="number" 
            placeholder="请输入手机号" 
            maxlength="11"
            placeholder-class="input-placeholder"
            class="input-field"
          />
        </view>

        <!-- 验证码输入 -->
        <view class="input-group">
          <view class="input-icon">
            <uni-icons type="locked-filled" size="20" color="#999"></uni-icons>
          </view>
          <input 
            v-model="code" 
            type="number" 
            placeholder="请输入验证码" 
            maxlength="6"
            placeholder-class="input-placeholder"
            class="input-field code-input"
          />
          <view 
            class="code-btn" 
            :class="{ 'code-btn-disabled': isCounting || !isPhoneValid }"
            @click="sendCode"
          >
            <text class="code-btn-text">{{ codeBtnText }}</text>
          </view>
        </view>

        <!-- 登录按钮 -->
        <view 
          class="login-btn" 
          :class="{ 'login-btn-active': canLogin }"
          @click="handleLogin"
        >
          <text class="login-btn-text">登 录</text>
        </view>
      </view>

      <!-- 协议勾选 -->
      <view class="protocol-section">
        <view class="protocol-item" @click="toggleProtocol">
          <view class="checkbox" :class="{ 'checkbox-checked': isAgree }">
            <uni-icons v-if="isAgree" type="checkmarkempty" size="14" color="#fff"></uni-icons>
          </view>
          <text class="protocol-text">我已阅读并同意</text>
        </view>
        <view class="protocol-links">
          <text class="protocol-link" @click="viewProtocol('user')">《用户协议》</text>
          <text class="protocol-text">和</text>
          <text class="protocol-link" @click="viewProtocol('privacy')">《隐私政策》</text>
        </view>
      </view>
    </view>

    <!-- 底部装饰 -->
    <view class="bottom-decoration">
      <text class="slogan">安全 · 便捷 · 高效</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      phone: '',
      code: '',
      redirectUrl: '', // 登录成功后跳转的页面
      isAgree: false,
      isCounting: false,
      countDown: 60,
      timer: null
    };
  },

  computed: {
    isPhoneValid() {
      return /^1[3-9]\d{9}$/.test(this.phone);
    },
    
    codeBtnText() {
      return this.isCounting ? `${this.countDown}s` : '获取验证码';
    },
    
    canLogin() {
      return this.isPhoneValid && /^\d{4,6}$/.test(this.code) && this.isAgree;
    }
  },

  methods: {
    goBack() {
      uni.navigateBack();
    },

    toggleProtocol() {
      this.isAgree = !this.isAgree;
    },

    async sendCode() {
      if (!this.isPhoneValid) {
        this.$utils.toast('请输入正确手机号');
        return;
      }
      
      if (this.isCounting) return;
      
      try {
        const res = await this.$request.post(this.$apis.user.sendSmsCode, { phone: this.phone });
        if (res.code === 0) {
          this.$utils.toast('验证码已发送');
          this.startCountDown();
          
          // 弹窗显示返回的验证码（测试环境使用）
          const verifyCode = res.result?.data?.code;
          if (verifyCode) {
            uni.showModal({
              title: '验证码',
              content: `您的验证码是：${verifyCode}`,
              showCancel: false,
              confirmText: '知道了'
            });
          }
        } else {
          this.$utils.toast(res.message || '发送失败');
        }
      } catch (error) {
        this.$utils.toast(error?.data?.message || '网络错误');
      }
    },

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

    async handleLogin() {
      if (!this.canLogin) return;
      
      if (!this.isAgree) {
        this.$utils.toast('请同意用户协议和隐私政策');
        return;
      }
      
      uni.showLoading({ title: '登录中...' });
      
      try {
        const res = await this.$request.post(this.$apis.user.loginByPhone, { 
          phone: this.phone, 
          code: this.code 
        });
        
        if (res.code === 0) {
          this.$utils.setStorage('token', res.result.data.token);
          this.$utils.setStorage('userInfo', res.result.data.userInfo);
          this.$utils.toast('登录成功');
          
          setTimeout(() => {
            // 如果有指定返回页面，则跳转到指定页面
            if (this.redirectUrl) {
              const decodedUrl = decodeURIComponent(this.redirectUrl)
              // 使用 redirectTo 关闭登录页后跳转到目标页
              uni.redirectTo({ url: decodedUrl })
            } else {
              // 默认跳转到首页
              uni.switchTab({ url: '/pages/home/home' });
            }
          }, 1000);
        } else {
          this.$utils.toast(res.message || '登录失败');
        }
      } catch (error) {
        this.$utils.toast(error?.data?.message || '网络错误');
      } finally {
        uni.hideLoading();
      }
    },

    viewProtocol(type) {
      const url = type === 'user' 
        ? '/pages/protocol/user-agreement' 
        : '/pages/protocol/privacy-policy';
      uni.navigateTo({ url });
    }
  },

  onLoad(options) {
    // 获取登录成功后要跳转的页面
    this.redirectUrl = options.redirect || ''
  },

  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF5F0 0%, #FFFFFF 50%, #F8F9FA 100%);
  position: relative;
  overflow: hidden;
}

// 背景装饰
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 600rpx;
  overflow: hidden;
  pointer-events: none;
  
  .circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.1;
    
    &.circle-1 {
      width: 600rpx;
      height: 600rpx;
      background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
      top: -200rpx;
      right: -200rpx;
    }
    
    &.circle-2 {
      width: 400rpx;
      height: 400rpx;
      background: linear-gradient(135deg, #FF8563 0%, #FFB088 100%);
      top: 100rpx;
      left: -150rpx;
    }
    
    &.circle-3 {
      width: 300rpx;
      height: 300rpx;
      background: linear-gradient(135deg, #FFD8C8 0%, #FFE8E0 100%);
      top: 300rpx;
      right: 50rpx;
    }
  }
}

// 返回按钮
.back-btn {
  position: absolute;
  top: calc(var(--status-bar-height) + 20rpx);
  left: 30rpx;
  width: 72rpx;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  z-index: 10;
  
  &:active {
    opacity: 0.8;
  }
}

// 内容区
.content-wrapper {
  padding: 200rpx 50rpx 0;
  position: relative;
  z-index: 1;
}

// 欢迎文字
.welcome-section {
  margin-bottom: 60rpx;
  
  .welcome-title {
    display: block;
    font-size: 56rpx;
    font-weight: 700;
    color: #333;
    margin-bottom: 16rpx;
    letter-spacing: 2rpx;
  }
  
  .welcome-subtitle {
    display: block;
    font-size: 28rpx;
    color: #999;
  }
}

// 表单卡片
.form-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.06);
  
  .input-group {
    display: flex;
    align-items: center;
    background: #F8F9FA;
    border-radius: 20rpx;
    padding: 24rpx 28rpx;
    margin-bottom: 30rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s;
    
    &:focus-within {
      border-color: #FF6B35;
      background: #FFF;
      box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.1);
    }
    
    &:last-of-type {
      margin-bottom: 50rpx;
    }
    
    .input-icon {
      margin-right: 20rpx;
      width: 44rpx;
      height: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      border-radius: 12rpx;
    }
    
    .input-field {
      flex: 1;
      font-size: 30rpx;
      color: #333;
      height: 44rpx;
      line-height: 44rpx;
    }
    
    .input-placeholder {
      color: #BBB;
      font-size: 28rpx;
    }
    
    .code-input {
      flex: 1;
      min-width: 140rpx;
    }
    
    .code-btn {
      padding: 16rpx 20rpx;
      background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
      border-radius: 12rpx;
      margin-left: 16rpx;
      flex-shrink: 0;
      min-width: 140rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &-text {
        font-size: 24rpx;
        color: #fff;
        font-weight: 500;
        white-space: nowrap;
      }
      
      &-disabled {
        background: #E0E0E0;
        
        .code-btn-text {
          color: #999;
        }
      }
      
      &:active:not(.code-btn-disabled) {
        opacity: 0.9;
      }
    }
  }
  
  .login-btn {
    height: 96rpx;
    background: linear-gradient(135deg, #FFD8C8 0%, #FFE8E0 100%);
    border-radius: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.15);
    transition: all 0.3s;
    
    &-text {
      font-size: 32rpx;
      color: #fff;
      font-weight: 600;
      letter-spacing: 4rpx;
    }
    
    &-active {
      background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
      box-shadow: 0 8rpx 32rpx rgba(255, 107, 53, 0.35);
    }
    
    &:active.login-btn-active {
      transform: scale(0.98);
    }
  }
}

// 协议区域
.protocol-section {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .protocol-item {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;
    
    .checkbox {
      width: 32rpx;
      height: 32rpx;
      border-radius: 8rpx;
      border: 2rpx solid #CCC;
      margin-right: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      
      &-checked {
        background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
        border-color: #FF6B35;
      }
    }
    
    .protocol-text {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .protocol-links {
    display: flex;
    align-items: center;
    
    .protocol-text {
      font-size: 24rpx;
      color: #999;
      margin: 0 4rpx;
    }
    
    .protocol-link {
      font-size: 24rpx;
      color: #FF6B35;
      font-weight: 500;
      
      &:active {
        opacity: 0.7;
      }
    }
  }
}

// 底部装饰
.bottom-decoration {
  position: absolute;
  bottom: 60rpx;
  left: 0;
  right: 0;
  text-align: center;
  
  .slogan {
    font-size: 24rpx;
    color: #CCC;
    letter-spacing: 4rpx;
  }
}
</style>
