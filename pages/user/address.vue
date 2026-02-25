<template>
	<scroll-view scroll-y class="student-module">
		<view class="title fs32"><text class="top-line"></text>学生个人信息</view>
		<form @submit="formSubmit" @reset="formReset">
			<view class="row">
				<text class="fs32">学生姓名<text class="text-main">*</text></text>
				<input type="text" class="fs26" placeholder="请输入学生姓名" />
			</view>
			<view class="row">
				<text class="fs32">性别<text class="fs26 text-main">*</text></text>
				<radio-group name="radio">
					<label>
						<radio value="radio1" checked="" /><text>男</text>
					</label>
					<label>
						<radio value="radio2" /><text>女</text>
					</label>
				</radio-group>
			</view>
			<view class="row">
				<text class="fs32">家长电话<text class="fs26 text-main">*</text></text>
				<input type="tel" placeholder="请输入家长电话" />
			</view>
			<view class="row">
				<text class="fs32">当前就读年级<text class="fs26 text-main">*</text></text>
				<input type="text" placeholder="请输入当前就读年级" />
			</view>
			<view class="row">
				<text class="fs32">校区<text class="text-main">*</text></text>
				<view class="flex align-center justify-between" @click="openRefund">
					<text class="fs26"
						:class="!request.xiaoqu_name ? 'text-grey':''">{{ request.xiaoqu_name ? request.xiaoqu_name:  '请选择'}}</text>
					<uni-icons :size="18" class="uni-icon-wrapper" color="#bbb" type="arrowright" />
				</view>
			</view>
			<view class="row">
				<text class="fs32">咨询老师<text class="text-main">*</text></text>
				<input type="text" placeholder="请输入咨询老师" />
			</view>
			<view class="row">
				<text class="fs32">学生照片<text class="text-main">*</text></text>
				<!-- 	<uni-upload :description="'上传学生照片'" :count="1" :list="request.studentImg" @back="getUploadImg">
				</uni-upload> -->
			</view>
			<view class="row">
				<text class="fs32">身份证号码<text class="text-main">*</text></text>
				<input class="uni-input" type="idcard" placeholder="请输入身份证号码" />
			</view>
			<view class="row">
				<text class="fs32">就读学校<text class="text-main">*</text></text>
				<input type="text" placeholder="请输入就读学校" />
			</view>
		</form>
		<view class="fixed">
			<button class="success-btn">修改</button>
			<button class="blue-btn">新增</button>
		</view>
		<select-list-popup :title="'请选择校区'" :list="[{id:1,name:'桐锌林校区'},{id:2,name:'中医大校区'},{id:3,name:'高新校区'}]"
			ref="xiaoqu" @back="selectChange"></select-list-popup>
	</scroll-view>
</template>
<script>
	import selectListPopup from '@/components/select-list-popup/select-list-popup.vue'
	// import uniUpload from '@/components/uni-upload/uni-upload.vue' //上传
	export default {
		data() {
			return {
				onscroll: 0,
				request: {
					xiaoqu_name: '',
					studentImg: []
				},
			}
		},
		methods: {
			// 打开校区
			openRefund() {
				this.$refs['xiaoqu'].openPopup()
			},
			/* 选择校区 */
			selectChange(e) {
				this.request.xiaoqu_name = e.name;
			},
			// 获取图片
			getUploadImg(val) {
				this.request.studentImg.push(val)
			},
			formSubmit(e) {
				this.$utils.toast('123')
				console.log(e.detail.value);
			},
		},
		components: {
			selectListPopup,
			// uniUpload
		},
	}
</script>

<style lang="scss" scoped>
	.student-module {
		padding-bottom: 116upx;

		.title {
			padding: 30upx;
			background-color: #FFFFFF;
			border-radius: 18upx;
			font-weight: 600;
		}

		form {
			display: block;
			background-color: #FFFFFF;
			border-radius: 12upx;
			margin: 20upx;
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