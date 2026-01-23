<template>
	<view class="myzuoye">
		<view class="header borderb">
			<view class="name flex"><text class="fs32 fwb text-white">学生：张小小</text><text
					class="fs32 fwb text-white">班型：Java班</text></view>
			<view class="cn-name fs26 inline text-white">zhangxiaoxiao</view>
		</view>
		<view class="title fs32"><text class="top-line"></text>{{ activeIndex == 0 ? '比赛列表' : '作业情况'}}</view>
		<view class="fast-tab">
			<fast-tab :list="tabData" :active-index.sync="activeIndex" @on-change="tabChange($event)" :flex="true"
				:lineRadius="lineRadius"></fast-tab>
		</view>
		<view class="contrain" v-if="activeIndex == 0">
			<scroll-view scroll-y class="contrain-list">
				<view class="contrain-list-item" v-for="(item,index) in bisaiList" :key="index" @click="goPage">
					<view class="fs32">{{ item.title }}</view>
					<view class="flex">
						<text class="padding-right">比赛结果：{{ item.result }}</text>
						<text class="text-gray padding-right">{{ item.status }}</text>
						<text class="padding-right">{{ item.create_time }}</text>
					</view>
					<view class="right-icon"><uni-icons :size="18" class="uni-icon-wrapper" color="#bbb" type="arrowright" />
					</view>
				</view>
			</scroll-view>
		</view>
		<view class="contrain" v-if="activeIndex == 1">
			<scroll-view scroll-y class="contrain-list">
				<view class="contrain-list-item" v-for="(item,index) in bisaiList" :key="index" @click="goPage">
					<view class="fs32">{{ item.title }}</view>
					<view class="flex">
						<text>完成情况：{{ item.result }}</text>
					</view>
					<view class="right-icon"><uni-icons :size="18" class="uni-icon-wrapper" color="#bbb" type="arrowright" />
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>


<script>
	import FastTab from '@/components/fast-tab/fast-tab.vue'
	export default {
		data() {
			return {
				tabData: [{
						label: "比赛成绩"
					},
					{
						label: "作业情况"
					}
				],
				activeIndex: 0,
				lineRadius: '20rpx',
				bisaiList: [{
						id: '1',
						status: '已结束',
						title: '【2023秋季语法巩固班】0106桐梓林',
						result: '0/600',
						create_time: '2024-1-9 19:48'
					},
					{
						id: '2',
						status: '已结束',
						title: '【2023秋季语法巩固班】0106桐梓林1',
						result: '200/600',
						create_time: '2024-1-9 19:48'
					},
					{
						id: '3',
						status: '已结束',
						title: '【2023秋季语法巩固班】0106桐梓林2',
						result: '50/600',
						create_time: '2024-1-9 19:48'
					}, {
						id: '4',
						status: '已结束',
						title: '【2023秋季语法巩固班】0106桐梓林3',
						result: '100/600',
						create_time: '2024-1-9 19:48'
					}, {
						id: '5',
						status: '已结束',
						title: '【2023秋季语法巩固班】0106桐梓林4',
						result: '100/600',
						create_time: '2024-1-9 19:48'
					}, {
						id: '6',
						status: '已结束',
						title: '【2023秋季语法巩固班】0106桐梓林5',
						result: '100/600',
						create_time: '2024-1-9 19:48'
					},
					{
						id: '7',
						status: '已结束',
						title: '【2023秋季语法巩固班】0106桐梓林',
						result: '0/600',
						create_time: '2024-1-9 19:48'
					},
					{
						id: '8',
						status: '已结束',
						title: '【2023秋季语法巩固班】0106桐梓林1',
						result: '200/600',
						create_time: '2024-1-9 19:48'
					},
					{
						id: '9',
						status: '已结束',
						title: '【2023秋季语法巩固班】0106桐梓林2',
						result: '50/600',
						create_time: '2024-1-9 19:48'
					}, {
						id: '10',
						status: '已结束',
						title: '【2023秋季语法巩固班】0106桐梓林3',
						result: '100/600',
						create_time: '2024-1-9 19:48'
					}, {
						id: '11',
						status: '已结束',
						title: '【2023秋季语法巩固班】0106桐梓林4',
						result: '100/600',
						create_time: '2024-1-9 19:48'
					}, {
						id: '12',
						status: '已结束',
						title: '【2023秋季语法巩固班】0106桐梓林5',
						result: '100/600',
						create_time: '2024-1-9 19:48'
					}
				]
			}
		},
		methods: {
			// 我的作业详情
			goPage(item) {
				this.$Router.push({
					path: '/pages/home/myzuoyeDetail',
					query: item
				})
			},
			tabChange(event) {
				this.activeIndex = event;
			},
		},
		components: {
			FastTab
		}
	}
</script>

<style lang="less" scoped>
	.myzuoye {
		.header {
			padding: 44upx 40upx;
			background: #2196F3;
			position: fixed;
			left: 0;
			top: 0;
			width: 100%;
			z-index: 2;

			.name {
				justify-content: space-between;
				padding-bottom: 20upx;
			}

			.cn-name {
				line-height: 5upx;
			}
		}

		.fast-tab {
			background: #FFFFFF;
			padding: 0 40upx;
			position: fixed;
			width: 100%;
			bottom: 0;
			z-index: 2;
		}

		.title {
			padding: 30upx;
			background-color: #FFFFFF;
			font-weight: 600;
			z-index: 2;
			position: sticky;
			top: 140upx;
		}

		.contrain {
			border-radius: 15upx;
			padding-top: 125upx;

			&-list {
				padding-bottom: 100upx;
				margin-top: 20upx;

				&-item {
					border-radius: 15upx;
					background-color: #FFFFFF;
					padding: 20upx 30upx;
					margin: 20upx;
					line-height: 50upx;
					position: relative;

					.right-icon {
						position: absolute;
						top: 30%;
						right: 20upx;
						z-index: 1;
					}
				}
			}
		}
	}
</style>