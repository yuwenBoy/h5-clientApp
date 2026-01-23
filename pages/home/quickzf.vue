<template>
	<view class="quickzf">
		<form @submit="formSubmit" @reset="formReset">
			<view class="row">
				<text class="fs32">缴费项目<text class="text-main">*</text></text>
				<view class="flex align-center justify-between" @click="openSelect">
					<text class="fs26"
						:class="!request.xiaoqu_name ? 'text-grey':''">{{ request.xiaoqu_name ? request.xiaoqu_name:  '请选择'}}</text>
					<uni-icons :size="18" class="uni-icon-wrapper" color="#bbb" type="arrowright" />
				</view>
			</view>
			<view class="row">
				<text class="fs32">学生姓名<text class="text-main">*</text></text>
				<input class="input-placeholder" type="text" placeholder="请输入学生姓名" />
			</view>
			<view class="row">
				<text class="fs32">手机号<text class="text-main">*</text></text>
				<input class="uni-input" type="idcard" placeholder="请输入手机号" />
			</view>
			<view class="row">
				<text class="fs32">收费老师<text class="text-main">*</text></text>
				<input placeholder="请输入收费老师" />
			</view>
			<view class="row">
				<text class="fs32">收费金额<text class="text-main">*</text></text>
				<input placeholder="请输入收费金额" />
			</view>
		</form>
	  <view class="text-center margin-top">
			<button class="success-btn" @click="submit">确认缴费</button>
			<button class="blue-btn" @click="applyDiscounts">申请优惠</button>
		</view>
		<!--缴费项目选择弹框-->
		<select-list-popup :title="'请选择缴费项目'" :list="[{id:1,name:'缴费项目1'},{id:2,name:'缴费项目2'},{id:3,name:'缴费项目3'}]"
			ref="xiaoqu" @back="selectChange"></select-list-popup>
	</view>
</template>
<script>
	import selectListPopup from '@/components/select-list-popup/select-list-popup.vue'
	export default {
		data() {
			return {
				request: {
					xiaoqu_name: '',
				},
			}
		},
		methods: {
			// 打开缴费项目
			openSelect() {
				this.$refs['xiaoqu'].openPopup()
			},
			/* 选择缴费项目 */
			selectChange(e) {
				this.request.xiaoqu_name = e.name;
			},
			formSubmit(e) {
				this.$utils.toast('123')
				console.log(e.detail.value);
			},
			// 申请优惠
			applyDiscounts(){
				this.$Router.push({path:'/pages/home/courseapply'})
			}
		},
		components: {
			selectListPopup,
		},
	}
</script>

<style lang="scss" scoped>
	.quickzf {
		padding-bottom: 116upx;

		.title {
			margin: 20upx;
			padding: 20upx;
			text-align: center;
			border-radius: 12upx;
			background-color: #FFFFFF;
		}

		form {
			display: block;
			background-color: #FFFFFF;
			border-radius: 12upx;
			margin: 0 20upx;
			padding: 30upx;

			.row {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 30upx;

				text {
					max-width: 360upx;
				}

				input {
					background-color: #F2F2F2;
					text-indent: 20upx;
					height: 2.0em;
					line-height: 2.0em;
					width: calc(100vw - 360upx);
				}

				radio-group {
					width: calc(100vw - 360upx);

					radio {
						transform: scale(0.75);
					}

					uni-label:first-child,
					label:first-child {
						margin-right: 20upx;
					}
				}
			}
		}
	}
</style>