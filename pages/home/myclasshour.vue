<template>
	<scroll-view scroll-y class="myclasshour">
		<view class="box" @click="hourDetail(item)"
			:class="parseInt(item.shengyu_hours)==0 ? 'success':parseInt(item.total_hours)==parseInt(item.shengyu_hours) ? 'unsuccess':parseInt(item.total_hours)>parseInt(item.shengyu_hours) ?'insuccess':''"
			v-for="(item,index) in list" :key="index">
			<view class="fs30 text-white title">{{ item.name }}
				<view class="detail">详情<uni-icons :size="12" class="uni-icon-wrapper" color="#ffffff" type="arrowright" /></view>
			</view>
			<view class="flex"><text class="text-white">班型:{{ item.class_type }}</text>
			<text class="text-white">课时:{{ item.total_hours }}</text>
			<text class="text-white">已上课时:{{ item.shengyu_hours }}</text></view>
		</view>
	</scroll-view>
</template>

<script>
	export default {
		data() {
			return {
				list: [{
						id: 10,
						name: '校区名称0',
						class_type: 'AC班',
						total_hours: '18',
						shengyu_hours: '0'
					},
					{
						id: 1,
						name: '校区名称1',
						class_type: 'A班',
						total_hours: '1',
						shengyu_hours: '0'
					},
					{
						id: 2,
						name: '校区名称2',
						class_type: 'B班',
						total_hours: '2',
						shengyu_hours: '2'
					},
					{
						id: 3,
						name: '校区名称3',
						class_type: 'C班',
						total_hours: '3',
						shengyu_hours: '2'
					},
					{
						id: 4,
						name: '校区名称4',
						class_type: 'D班',
						total_hours: '4',
						shengyu_hours: '3'
					},
					{
						id: 5,
						name: '校区名称5',
						class_type: 'F班',
						total_hours: '5',
						shengyu_hours: '4'
					},
					{
						id: 6,
						name: '校区名称6',
						class_type: 'G班',
						total_hours: '6',
						shengyu_hours: '5'
					},
					{
						id: 7,
						name: '校区名称7',
						class_type: 'H班',
						total_hours: '7',
						shengyu_hours: '6'
					},
					{
						id: 8,
						name: '校区名称8',
						class_type: 'I班',
						total_hours: '8',
						shengyu_hours: '7'
					},
					{
						id: 9,
						name: '校区名称9',
						class_type: 'J班',
						total_hours: '9',
						shengyu_hours: '8'
					}
				]
			}
		},
		methods: {
			// 课时详情
       hourDetail(){
          this.$Router.push({path:'/pages/home/myclasshourDetail'})
			 }
		}
	}
</script>

<style lang="less" scoped>
	.myclasshour {
		background-color: #FFFFFF;
		margin: 0 auto;
		padding: 40upx;

		.box {
			position: relative;
			line-height: 60upx;
			padding: 16upx 20upx 10upx 20upx;
			border-radius: 16upx;
			margin-bottom: 20upx;

			.title {
				display: flex;
				justify-content: space-between;
			}
			.flex {
				justify-content: space-between;
			}
		}

		.unsuccess {
			background: #007aff;
		}

		.success {
			background: #18bc37;
		}

		.insuccess {
			background: #f3a73f;
		}
	}
</style>