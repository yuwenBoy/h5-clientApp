<template>
	<view class="messageDetail">
		<view class="title flex align center">
			{{ detail.name }}  <text>发布日期：2024年1月7日</text>
		</view>
		<view class="content">寒假的开始寒假的开始寒假的开始寒假的开始寒假的开始寒假的开始寒假的开始寒假的开始寒假的开始</view>
		<view class="normal-btn">
			<button type="primary" size="large" :disabled="disabled" @click="okRend">确认阅读</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				detail:{},
				disabled:false,
			}
		},
		mounted(){
			this.detail = this.$Route.query
		},
		methods: {
			okRend(){
			   this.$utils.toast('确认阅读');
			}
		}
	}
</script>

<style lang="less" scoped>
   .messageDetail{
		 height: calc(100vh - 240upx);
		 background-color: #FFFFFF;
		 margin:20upx;
		 padding: 20upx 30upx;
		 .title{padding: 30upx 12upx;justify-content: space-between;font-weight: bold;}
		 .content{padding: 100upx 20upx 20upx 20upx;line-height: 60upx;}
		 .item-botton_right{text-align: right;}
		 .normal-btn{margin-top: 100upx;}
	 }
</style>
