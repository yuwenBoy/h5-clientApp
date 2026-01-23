<template>
	<view class="conrseapply">
		<view class="detail-title">
			<view>2024年1月10日 星期三</view>
			<view>16:30 - 18:30 C++语法入门班</view>
		</view>
		<view class="detail-info">
			<view class="borderb tips">你想调到哪节课，请选择？</view>
			<view class="input-box">
				<text>校区<text class="fs26 text-main">*</text></text>
				<view class="flex align-center justify-between" @click="openSchool">
					<text class="fs26" :class="!schoolType ? 'text-grey':''">{{ schoolType ? schoolType:  '请选择'}}</text>
					<uni-icons :size="18" class="uni-icon-wrapper" color="#bbb" type="arrowright" />
				</view>
			</view>
			<view class="input-box">
				<text>班型<text class="fs26 text-main">*</text></text>
				<view class="flex align-center justify-between" @click="openClassType">
					<text class="fs26" :class="!classType ? 'text-grey':''">{{ classType ? classType:  '请选择'}}</text>
					<uni-icons :size="18" class="uni-icon-wrapper" color="#bbb" type="arrowright" />
				</view>
			</view>
			<view class="desc-box borderb" v-for="(item,index) in radioData" :key="index" @click="radioSelect(index)">
				<view class="radio-item"><view>{{ item.filed_name }}</view>
				<view>{{ item.filed_name2 }}</view></view>
				<view class="radio-icon"><text :class="item.check ? 'select' : 'unselect'"></text></view>
			</view>
		</view>
		<view class="fixed">
			<button class="success-btn">确认调课</button>
			<button class="cancel-btn">取消</button>
		</view>
		<select-list-popup :title="'请选择'" :list="[{id:1,name:'桐锌林校区'},{id:2,name:'中医大校区'},{id:3,name:'高新校区'}]" ref="xiaoqu"
			@back="selectChange"></select-list-popup>
		<select-list-popup :title="'请选择班型'" :list="[{id:1,name:'java班'},{id:2,name:'PHP班'},{id:3,name:'net班'}]"
			ref="classTypeName" @back="changeClassType"></select-list-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				schoolType: '',
				classType: '',
				radioActive:0,
				radioData:[{id:'1',filed_name:'2024年1月10日 星期三',filed_name2:'16:30 - 18:30 Java语法入门班'},
				{id:'2',filed_name:'2024年1月11日 星期四',filed_name2:'16:30 - 18:30 Java语法33入门班'},
				{id:'3',filed_name:'2024年1月12日 星期五',filed_name2:'16:30 - 18:30 Java语法11入门班'},
				{id:'4',filed_name:'2024年1月13日 星期六',filed_name2:'16:30 - 18:30 Java语法入444门班',}]
			}
		},
		methods: {
			// 打开校区
			openSchool() {
				this.$refs['xiaoqu'].openPopup()
			},
			// 打开班型
			openClassType() {
				this.$refs['classTypeName'].openPopup()
			},
			/* 选择校区 */
			selectChange(e) {
				this.schoolType = e.name;
			},
			/* 选择班型 */
			changeClassType(e) {
				this.classType = e.name;
			},
			// 选中班型
			radioSelect(index){
				const item = this.radioData[index]
				this.radioData.filter((t) => {
					if (t.id == item.id) {
						this.$set(t, 'check', true)
					} else {
						this.$set(t, 'check', false)
					}
				})
			}
		}
	}
</script>

<style lang="less" scoped>
	.conrseapply {
		.detail-title {
			background-color: #FFFFFF;
			line-height: 50upx; 
			padding: 30upx;
			text-align: center;
		}

		.detail-info {
			background-color: #FFFFFF;
			margin: 20upx;
			padding: 30upx 20upx;
      .tips{
					padding: 20upx;
			}
			.input-box {
				padding: 20upx;
				display: flex;
				align-items: center;
				justify-content: space-between;
			}
			.desc-box{
				padding: 20upx;
				display: flex;
				align-items: flex-end;
				.radio-item{line-height: 50upx;}
				.radio-icon{position: absolute;top: 50%;right: 60upx;}
				.select{
					width: 35upx;
					height: 35upx;
					position: relative;
					&::before {
						content: '';
						width: 35upx;
						height:35upx;
						background: url('../../static/img/check.png') no-repeat;
						background-size: 35upx 35upx;
						position: absolute;
						top:0;
						left: 0;
					}
				}
				.unselect{
					width: 35upx;
					height:35upx;
					position: relative;
					&::before {
						content: '';
				  	width: 35upx;
					  height:35upx;
						background: url('../../static/img/nocheck.png') no-repeat;
						background-size: 35upx 35upx;
						position: absolute;
						top:0;
						left: 0;
					}
				}
			}
		}
	}
</style>