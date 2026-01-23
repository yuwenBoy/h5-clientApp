<template>
	<view class="myclass">
		<view class="myclass-list borderb" v-for="(item,index) in list" :key="index">
			<view class="fs36 text-black">{{ item.name }}</view>
			<view class="flex"><text class="fs24 text-gray">班型:{{ item.class_type }}</text><text class="fs24 text-gray">时间:{{ item.create_time }}</text><text class="fs24 text-gray">老师:{{ item.teacher }}</text></view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list:[{id:10,name:'校区名称0',class_type:'AC班',create_time:'2024年1月10日-2024年2月10日',teacher:'毛辉'},
				{id:1,name:'校区名称1',class_type:'A班',create_time:'2024年1月10日-2024年2月10日',teacher:'毛辉9'},
				{id:2,name:'校区名称2',class_type:'B班',create_time:'2024年1月10日-2024年2月10日',teacher:'毛辉1'},
				{id:3,name:'校区名称3',class_type:'C班',create_time:'2024年1月10日-2024年2月10日',teacher:'毛辉2'},
				{id:4,name:'校区名称4',class_type:'D班',create_time:'2024年1月10日-2024年2月10日',teacher:'毛辉3'},
				{id:5,name:'校区名称5',class_type:'F班',create_time:'2024年1月10日-2024年2月10日',teacher:'毛辉4'},
				{id:6,name:'校区名称6',class_type:'G班',create_time:'2024年1月10日-2024年2月10日',teacher:'毛辉5'},
				{id:7,name:'校区名称7',class_type:'H班',create_time:'2024年1月10日-2024年2月10日',teacher:'毛辉6'},
				{id:8,name:'校区名称8',class_type:'I班',create_time:'2024年1月10日-2024年2月10日',teacher:'毛辉7'},
				{id:9,name:'校区名称9',class_type:'J班',create_time:'2024年1月10日-2024年2月10日',teacher:'毛辉8'}]
			}
		},
		methods: {
			
		}
	}
</script>

<style lang="less" scoped>
   .myclass{
		 background-color: #FFFFFF;
		 margin: 0 auto;
		 padding: 40upx;
		 .myclass-list{
			 line-height: 50upx;
			 padding: 16upx 20upx 10upx 20upx;
			 .flex{justify-content: space-between;}
		 }
	 }
</style>
