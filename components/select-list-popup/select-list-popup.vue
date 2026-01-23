<template>
	<view>
		<uni-popup ref="popup" type="bottom">
			<view class="select-choose">
				<view class="title fs30 flex justify-between align-center position-rel">
					<text class="label position-abs fs30">{{ title }}</text>
					<view class="close" @click="close"></view>
				</view>
				<scroll-view class="select-list" scroll-y>
					<view @click="select(index)" v-for="(item,index) in arrList" :key="index"
						class="select-item border-b flex justify-between align-center">
						<text>{{item.name}}</text>
						<view class="radio" :class="item.check?'select':'unselect'"></view>
					</view>
				</scroll-view>
			</view>
			<view class="fixed-button cu-bar bg-white-btn tabbar">
				<button type="primary" size="large" @click="close">关闭</button>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	export default {
		props: {
			title: {
				type: String,
				default: null
			},
			noPopup: {
				type: Boolean,
				default: false
			},
			list: {
				type: Array,
				default: []
			},
		},
		data() {
			return {
				arrList: this.list
			}
		},
		methods: {
			close() {
				this.$refs.popup.close()
			},
			// 开启地址选择弹窗
			openPopup(reset) {
				this.$refs.popup.open()
			},
			select(index) {
				const item = this.arrList[index]
				this.arrList.filter((t) => {
					if (t.id == item.id) {
						this.$set(t, 'check', true)
					} else {
						this.$set(t, 'check', false)
					}
				})
				this.$emit('back', this.arrList[index])
				this.$refs.popup.close()
			}
		},
		watch: {
			list: {
				handler: function(val, oldval) {
					if (val) {
						this.arrList = val
					}
				},
				deep: true, //对象内部的属性监听，也叫深度监听
				immediate: true
			}
		},
		components: {}
	}
</script>

<style lang="scss" scoped>
	.select-choose {
		background: $uni-bg-color;
		height: 795upx;
		border-radius: 15upx 15upx 0px 0px;
		font-size: $uni-font-size-mid;

		.title {
			text-align: center;
			padding: 20upx 0;
		}

		.select-list {
			padding: 0 30upx;
			height: 564upx;

			.select-item {
				height: 95upx;
			}
			
			.select{
				width: 29upx;
				height: 29upx;
				position: relative;
				&::before {
					content: '';
					width: 29upx;
					height: 29upx;
					background: url('../../static/img/check.png') no-repeat;
					background-size: 29upx 29upx;
					position: absolute;
					top:0;
					left: 0;
				}
			}
			.border-b{
				border-bottom: 1px solid #f0f0f0;
			}
			.unselect{
				width: 29upx;
				height: 29upx;
				position: relative;
				&::before {
					content: '';
					width: 29upx;
					height: 29upx;
					background: url('../../static/img/nocheck.png') no-repeat;
					background-size: 29upx 29upx;
					position: absolute;
					top:0;
					left: 0;
				}
			}
		}
	}

	.title {
		padding: 0 0 0 0upx;
		color: $uni-text-color;
		height: 80upx;

		.back {
			width: 58upx;
			height: 80upx;
			background: url('../../static/img/user/arrow-left.png') no-repeat;
			background-size: 18upx auto;
			background-position: center center;
		}

		.label {
			width: 60%;
			margin-left: 20%;
			text-align: center;
			left: 0;
		}

		.close {
			position: absolute;
			right: 15upx;
			width: 60upx;
			height: 60upx;
			background: url('../../static/img/user/close.png') no-repeat;
			background-size: 37upx auto;
			background-position: center center;
		}
	}
</style>
