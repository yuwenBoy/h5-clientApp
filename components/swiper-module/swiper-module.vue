<template>
	<view class="swiper-module" :style="{
				'margin': `0 ${$utils.default_module_wide()}`+ $utils.getPX(),
				'margin-bottom':`${$utils.default_module_high()}`+ $utils.getPX(),
				'background': rowAndCol.moduleBgColor,
				'padding-top':'150'+$utils.getPX(),
				'border-radius': rowAndCol.moduleRadius 
			}">
		<swiper class="swiper" :style="{'max-width':'100%','height': rowAndCol.moduleHeight + $utils.getPX()}"
			:autoplay="true" :interval="interval" :duration="duration" @change="swiperChange">
			<swiper-item style="display: flex;flex-wrap: wrap;" :style="{'justify-content': flexType}"
				v-for="(item, index) in pageList" :key="index">
				<view v-for="(child, childIndex) in item.list" :key="child.id" class="swiper-item margin-b10"
					:style="{'width': rowAndCol.width + $utils.getPX()}" @click="clickItem(child, index, childIndex)">
					<view>
						<image :src="child.image"
							:style="{'width': rowAndCol.width + $utils.getPX(), 'height': rowAndCol.height + $utils.getPX()}"
							lazy-load />
						<!-- <customImage :url="child.image" :customStyle="{'width': rowAndCol.width + $utils.getPX(), 'height': rowAndCol.height + $utils.getPX()}"></customImage> -->
					</view>
				</view>
			</swiper-item>
		</swiper>
		<view v-if="pageList.length > 1" class="swiper-page-container"
			:class="{'line-page-box': (rowAndCol.row === 1 && rowAndCol.col === 5) || rowAndCol.row !== 1}"
			style="background: #fff;">
			<view class="swiper-page"
				:class="(rowAndCol.row === 1 && rowAndCol.col === 5) || rowAndCol.row !== 1 ? 'line-page' : 'dot-page'"
				:style="{'width': (rowAndCol.row === 1 && rowAndCol.col === 5) || rowAndCol.row !== 1 ? (18 * pageList.length + 18) + $utils.getPX() : ''}">
				<view class="page-item" :style="{
						'left': currentIndex === index ? 18 * currentIndex + $utils.getPX() : ''
					}" v-for="(item, index) in pageList" :key="index" :class="{'active': currentIndex === index}"></view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'swiper-module',
		props: {
			item_data: {
				type: Object,
				default: () => {
					return {}
				}
			},
			flexType: {
				type: String,
				default: 'space-between'
			},
			module_type: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				moduleStyle: {},
				info: this.item_data,
				interval: 5000, // 时间间隔
				duration: 500, // 滑动时长
				rowAndCol: {}, // 行列信息
				pageList: [], // 处理完分页的列表
				currentIndex: 0 // 当前活动分页
			}
		},
		created() {
			this.rowAndCol = this.$utils.getRowAndCol(this.info)
			console.log(this.rowAndCol)
			// 模块的样式
			this.moduleStyle = {
				'margin-left': this.info.model_margin === '1' ? ('20' + this.$utils.getPX()) : '0',
				'margin-bottom': this.info.model_rows_margin === '1' ? ('20' + this.$utils.getPX()) : '0',
				'background': this.rowAndCol.moduleBgColor,
				'padding': this.rowAndCol.modulePadding,
				'border-radius': this.rowAndCol.moduleRadius
			}
			// 重新分页
			this.getPageList()
		},
		mounted() {},
		methods: {
			getPageList() {
				let currentLen = this.info.items ? this.info.items.length : 0
				let totalLen = this.rowAndCol.total
				let overLen = totalLen - currentLen
				if (currentLen > 0 && overLen > 0) {
					for (let i = 0; i < overLen; i++) {
						this.info.items.push({})
					}
				}
				let oldlist = this.info.items
				this.initList(oldlist)
			},
			// 超过每页总条数显示第二页
			initList(arr) {
				let num = this.rowAndCol.total
				if (arr) {
					for (var i = 0, j = arr.length; i < j; i += num) {
						this.pageList.push({
							list: arr.slice(i, i + num)
						})
					}
				}
			},
			// 轮播图切换
			swiperChange(val) {
				this.currentIndex = val.detail.current
			},
			// 点击商品
			clickItem(item, pIndex, itemIndex) {
				let label = `${pIndex + 1}-${itemIndex + 1}-${item.title}`
				item = {
					...item,
					...this.$utils.trackingData(this.info, item, label)
				}
				this.$utils.onclickitem(item, [], this.info.isSpecial)
			}
		},
		watch: {
			item_data: {
				handler: function(val, oldval) {
					this.info = val
				},
				deep: true, //对象内部的属性监听，也叫深度监听
				immediate: true
			}
		}
	}
</script>

<style lang="scss">
	.margin-b10 {
		margin-bottom: 20upx;
	}

	.swiper-module {
		.goods-title {
			display: -webkit-box;
			height: 56upx;
 			line-height: 28upx;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			text-align: center;
			font-size: 22upx;
		}

		.goods-price {
			text-align: center;
			display: block;
		}

		.swiper-page-container {
			position: relative;

			.swiper-page {
				display: flex;
				justify-content: center;
				width: 100%;

				.page-item.active {
					background: $uni-bg-color-main;
				}
			}

			.dot-page {
				position: absolute;
				bottom: 12upx;

				.page-item {
					width: 14upx;
					height: 14upx;
					border-radius: 100%;
					background: $uni-bg-color;
					box-shadow: 0 0 2upx 0 rgba(149, 149, 149, 0.25);
					margin-left: 8upx;
				}

				.page-item:first-child {
					margin-left: 0;
				}
			}

			.line-page {
				height: 4upx;
				border-radius: 8upx;
				background: #d9d9d9;
				position: relative;

				.page-item.active {
					width: 36upx;
					position: absolute;
					height: 4upx;
					border-radius: 8upx;
				}

				.page-item:first-child {
					margin-left: 0;
				}
			}
		}

		.line-page-box {
			padding: 24upx 0 20upx;
			background-color: #F5F5F5;
			display: flex;
			justify-content: center;
		}

		.swiper-item {
			// display: flex;
			// flex-wrap: wrap;
			// justify-content: space-between;
		}
	}
</style>
