<template>
	<scroll-view scroll-y @scroll="onscroll" class="message">
		 <view class="message-module">
			 <view class="item" v-for="(item,index) in list" :key="item.id" @click="goPage(item)">{{ item.name }}</view>
		 </view>
	</scroll-view>
</template>

<script>
	export default {
		data() {
			return {
				 scrollTop: 0,
				 list:[{id:'1',name:'寒假开班通知1'},{id:'2',name:'寒假开班通知2'},{id:'3',name:'寒假开班通知3'},{id:'4',name:'寒假开班通知4'},{id:'5',name:'寒假开班通知5'}]
			}
		},
		methods: {
			// 家校消息详情
			goPage(item){
				 this.$Router.push({path: '/pages/home/messageDetail',query: item})
			},
			// 监听页面滚动
			onscroll (e) {
				this.scrollTop = e.detail.scrollTop
			},
		}
	}
</script>

<style lang="less" scoped>
  .message{
		.message-module{
			border-radius: 16upx;
			margin: 20upx;
			.item{
				background-color: #FFFFFF;
				padding: 24upx;
				margin: 20upx;
				border-radius: 14upx;
				font-size: 24upx;
			}
		}
	}
</style>
