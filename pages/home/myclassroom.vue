<template>
	<view class="myclassroom">
		<view class="search">
			<view class="search-input borderb" @click="openSelect">
				<view class="man-info  flex align-center warp">
					<text class="fs28">班型</text>
				</view>
				<view>
					<text class="fs26"
						:class="!info.classTypeName ? 'text-grey':''">{{ info.classTypeName ? info.classTypeName:  '请选择班型'}}</text>
					<uni-icons :size="14" class="uni-icon-wrapper" color="#bbb" type="arrowright" />
				</view>
			</view>
			<view class="search-input borderb">
				<view class="man-info  flex align-center warp">
					<text class="fs28">日期</text>
				</view>
				<view @click="open">
					<text class="fs26"
						:class="!info.dateTime ? 'text-grey':''">{{ info.dateTime ? info.dateTime:  '请选择日期'}}</text>
					<uni-icons :size="14" class="uni-icon-wrapper" color="#bbb" type="arrowright" />
				</view>
			</view>
		</view>
		<view class="list">
			<scroll-view scroll-y="false" class="list-item">
				<view class="contrain flex center justify-around flex-direction borderb" v-for="(item,index) in dataList"
					:key="index">
					<view><text class="man-info">校区：{{ item.school_name }}</text></view>
					<view><text class="man-info">班型：{{ item.class_type }}</text></view>
					<view><text class="man-info">时间：{{ item.create_time }}</text></view>
					<view class="flex justify-between">
						<text class="man-info">第几节课：{{ item.num }}</text>
						<view class="btn-info">
							<text class="text-green" @click="sumbit(item,1)">请假申请</text><text>|</text>
							<text class="text-orange" @click="sumbit(item,2)">调课申请</text><text>|</text>
							<text class="text-blue" @click="sumbit(item,3)">老师点评</text><text>|</text>
							<text class="text-gray" @click="sumbit(item,4)">直播回放</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		<select-list-popup :title="'请选择班型'" :list="[{id:1,name:'java班'},{id:2,name:'PHP班'},{id:3,name:'net班'}]"
			ref="classTypeName" @back="selectChange"></select-list-popup>
		<uni-calendar :showMonth="false" :start-date="'2022-1-1'" :end-date="endDate" :selected="selected"
			:isShowToday="false" :uniCalendarWeekHeight="true" :date="dateTime" @confirm="confirm" ref="calendar"
			:insert="false" />
	</view>
</template>

<script>
	import selectListPopup from '@/components/select-list-popup/select-list-popup.vue'
	export default {
		data() {
			return {
				info: {
					dateTime: '',
					classTypeName: '',
				},
				dateTime: '',
				dataList: [{
					id: '6',
					school_name: 'F校区',
					class_type: 'Java1221班',
					create_time: '2024年1月9日21:20:34',
					num: '1'
				},{
					id: '5',
					school_name: 'E校区',
					class_type: 'Javaaaa班',
					create_time: '2024年1月9日21:20:34',
					num: '1'
				},{
					id: '4',
					school_name: 'D校区',
					class_type: 'Java班',
					create_time: '2024年1月9日21:20:34',
					num: '1'
				}, {
					id: '3',
					school_name: 'C校区',
					class_type: 'Java班',
					create_time: '2024年1月9日21:20:34',
					num: '1'
				}, {
					id: '2',
					school_name: 'B校区',
					class_type: 'Java班',
					create_time: '2024年1月9日21:20:34',
					num: '1'
				}, {
					id: '1',
					school_name: 'A校区',
					class_type: 'Java班',
					create_time: '2024年1月9日21:20:34',
					num: '1'
				}]
			}
		},
		methods: {
			openSelect() {
				this.$refs['classTypeName'].openPopup()
			},
			/* 选择缴费项目 */
			selectChange(e) {
				this.info.classTypeName = e.name;
			},
			open() {
				this.$refs.calendar.open();
			},
			confirm(e) {
				this.dateTime = e.fulldate
				this.info.dateTime = this.getTurnTime(e.fulldate);
			},
			// 时间转换年月日
			getTurnTime(time) {
				let oldDate;
				if (time) {
					oldDate = time.split('-');
				}
				return oldDate[0] + '年' + parseInt(oldDate[1]) + '月' + parseInt(oldDate[2]) + '日'
			},
			sumbit(item, type) {
				switch (type) {
					case 1:
						uni.showModal({
							content: '确定请假吗？',
							confirmText: '确认请假',
							cancelText: '取消',
							confirmColor: '#00BE6D',
							cancelColor: '#999999',
							success: (res) => {
								if (!res.confirm) {
									this.$utils.toast('取消申请');
								}else{
									this.$utils.toast('请假申请');
								}
							}
						})
						break;
					case 2:
						 this.$Router.push({path:'/pages/home/courseapply'})
						break;
					case 3:
						uni.showModal({
							content:'老师点评内容',
							position: 'contentleft',
							showCancel: false,
							confirmColor: '#0081FF',
							success: function (res) {
							}
						})
						break;
					case 4:
						this.$utils.toast('直播回放');
						break;
				}
			}
		},
		components: {
			selectListPopup,
		}
	}
</script>

<style lang="less" scoped>
	.myclassroom {
		.search {
			position: fixed;
			top:0;
			left:0;
			width: 100%;
			z-index: 2;
			border-radius: 32upx;

			.search-input {
				background-color: #FFFFFF;
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 15upx 30upx;
				margin: 0 30upx;

				.man-info {
					&>text {
						display: block;
						width: 100%;
					}
				}

				.my-input::-placeholder {
					text-align: right;
				}
			}
		}

		.list {
			margin: 160upx 30upx 30upx 30upx;
			border-radius: 16upx;
			scroll-y:false;
			.list-item {
				.contrain {
					background-color: #FFFFFF;
					padding: 20upx;

					&>view {
						padding: 10upx 20upx;
					}
				}
			}
		}
	}
</style>