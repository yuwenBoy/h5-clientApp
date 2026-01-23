<template>
	<view class="contrain">
		<!-- 图片 -->
		<view class="flex justify-start align-center flex-wrap">
			<view class="upload" v-for="(item,index) in imageList" :key="index">
				<image class="image" :src="item" :data-src="item" lazy-load @tap="previewImage">
				</image>
				<view class="delete-icon" @tap="delect(index)">
					<image src="https://img.app.fuduoka.com/h5/img/icon/remove.png" mode=""></image>
				</view>
			</view>
			<view v-if="VideoOfImagesShow" @tap="chooseVideoImage" class="upload-icon">
				<view>
					<image src="https://img.app.fuduoka.com/h5/img/icon/photo_colse.png" class="image"></image>
				</view>
				<view class="fs22 font-gray">{{ desc }}</view>
			</view>
		</view>
	</view>
</template>
<script>
	var sourceType = [
		['camera'],
		['album'],
		['camera', 'album']
	];
	import { NODE_ENV } from '@/utils/luch-request_1.0.6/index.js'
	export default {
		name: 'uni-upload',
		props: {
			count: {
				type: Number,
				default: 3
			},
			description: {
				type: String,
				default: '上传图片(最多3张)'
			},
			type: {
				type: Number,
				default: 1
			},
			list: {
				type: Array,
				default: () => {
					return []
				}
			},
			video: {
				type: Array,
				default: () => {
					return []
				}
			}
		},
		data() {
			return {
				VideoOfImagesShow: true, // 页面图片或视频数量超出后，拍照按钮隐藏
				imageList: this.list, //存放图片的地址
				sourceType: ['拍摄', '相册', '拍摄或相册'],
				sourceTypeIndex: 2,
				cameraList: [{
					value: 'back',
					name: '后置摄像头',
					checked: 'true'
				}, {
					value: 'front',
					name: '前置摄像头'
				}],
				uploadCount: this.count,
				desc: this.description,
		  // 	// #ifdef H5
				// uploadUrl: (NODE_ENV == "product"||NODE_ENV == "pre") ? 'https://admin.app.fuduoka.com/rest/Image/uploadFile' : 'http://api.back.test.fuduoka.com:17004/rest/Image/uploadFile' // 上传地址,
				// // #endif
				// // 微信小程序上传接口协议仅支持https，所以分开赋值
				// // #ifdef MP-WEIXIN
				// uploadUrl:(NODE_ENV == "product"||NODE_ENV == "pre") ? 'https://admin.app.fuduoka.com/rest/Image/uploadFile' : 'https://xinwei.fuli.qqjiazu.cn/rest/Image/uploadFile' // 上传地址
				// // #endif
			}
		},
		onUnload() {
			(this.imageList = []), (this.sourceTypeIndex = 2), (this.sourceType = ['拍摄', '相册', '拍摄或相册'])
		},
		methods: {
			// 服务器端上传
			fileUploadApi(fileList, tapIndex) {
			 uni.showLoading({
			 	title: '图片上传中...',
			 	mask: true
			 })
			 // 多文件上传
			 fileList.forEach(item => {
			 	this.$request.upload(this.uploadUrl, {
			 		name: 'file',
			 		filePath: item
			 	}).then(res => {
			 		uni.hideLoading()
			 		this.imageList = this.imageList.concat(res.data.src)
			 		if (this.imageList.length == this.uploadCount) {
			 			this.VideoOfImagesShow = false //图片上传数量和count一样时，让点击拍照按钮消失
			 		}
			 	}).catch(err => {
			 		uni.hideLoading()
			 		this.$toast('上传图片失败')
			 	})
			 })
			},
			//点击上传图片或视频
			chooseVideoImage() {
				uni.showActionSheet({
					title: '', // 选择上传类型
					itemList:['图片'],
					success: res => {
						console.log(res)
						this.chooseImages()
					}
				})
			},
			// 选择图片
			chooseImages() {
				let that = this
				uni.chooseImage({
					count: 1, // that.uploadCount, //每次只能选择一张
					sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
					sourceType: ['album', 'camera'], //从相册选择
					success: res => {
						// 上传个数限制
						let request_count = that.uploadCount // 可上传个数
						let image_count = that.imageList.length // 已上传个数
						let select_count = res.tempFilePaths.length // 已选择个数
						if (image_count + select_count > request_count) {
							this.$toast('您还可上传' + (request_count - image_count) + '张，请重新选取图片')
						} else {
							this.fileUploadApi(res.tempFilePaths)
						}
					}
				})
			},
			// 预览图片
			previewImage: function(e) {
				var current = e.target.dataset.src
				uni.previewImage({
					current: current,
					urls: this.imageList
				})
			},
			// 删除图片
			delect(index) {
				uni.showModal({
					title: '提示',
					content: '是否要删除该图片',
					success: res => {
						if (res.confirm) {
							this.imageList.splice(index, 1)
						}
						if (this.imageList.length == this.uploadCount) {
							this.VideoOfImagesShow = false
						} else {
							this.VideoOfImagesShow = true
						}
					}
				})
			},
		},
		watch: {
			count: {
				handler: function(val, oldval) {
					this.uploadCount = val
				},
				immediate: true
			},
			// imageList: {
			// 	handler: function(val, oldval) {
			// 		this.$emit('back', val)
			// 	},
			// 	deep: true,
			// 	immediate: true
			// },
			list: {
				handler: function(val, oldval) {
					this.imageList = val
					this.$emit('back', val)
					if (this.imageList.length == this.uploadCount) {
						this.VideoOfImagesShow = false //图片上传数量和count一样时，让点击拍照按钮消失
					} else {
						this.VideoOfImagesShow = true
					}
				},
				deep: true,
				immediate: true
			}
		}
	}
</script>

<style lang="scss" scoped>
	.contrain {
		.upload {
			position: relative;
			width: 137upx;
			height: 137upx;
			border-radius: 5upx;
			margin: 14upx;
			text-align: center;

			.delete-icon {
				position: absolute;
				right: 0;
				top: 0;
				z-index: 1;

				image {
					width: 30upx;
					height: 30upx;
				}
			}
		}

		.upload-icon {
			width: 137upx;
			height: 137upx;
			border-radius: 5upx;
			border: 2upx dashed #979797;
			padding: 14upx;
			margin: 14upx;
			text-align: center;

			.image {
				width: 40upx;
				height: 30upx;
			}
		}
	}
</style>
