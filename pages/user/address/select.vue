<template>
	<view class="address-page" @click="closeAllSwipe">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-left">
				<view class="nav-back" @click.stop="goBack">
					<image class="back-icon" src="/static/img/back-icon.png" mode="widthFix"></image>
				</view>
				<text class="nav-title">选择收货地址</text>
			</view>
		</view>

		<!-- 页面内容 -->
		<view class="page-content">
			<!-- 搜索区域 -->
			<view class="search-section">
				<view class="city-select" @click="goCitySelect">
					<text class="city-name">{{ currentCity }}</text>
					<image class="city-arrow" src="/static/img/city-icon.png" mode="widthFix" />
				</view>
				<view class="search-box">
					<uni-icons type="search" size="18" color="#999" />
					<input class="search-input" v-model="searchKeyword" placeholder="请输入地址" placeholder-class="search-placeholder"
						@input="onSearchInput" confirm-type="search" @confirm="doSearch" />
					<view class="search-clear" v-if="searchKeyword" @click="clearSearch">
						<uni-icons type="clear" size="16" color="#999" />
					</view>
				</view>
			</view>

			<!-- 当前定位 -->
			<view class="location-section" v-if="currentLocation && !hasSearchKeyword">
				<view class="section-label">当前定位</view>
				<view class="location-item" @click="selectLocation">
					<image class="location-icon" src="/static/img/local-icon.png" mode="widthFix" />
					<text class="location-name">{{ currentLocation }}</text>
					<text class="re-locate" @click.stop="reLocate">重新定位</text>
				</view>
			</view>

			<!-- 收货地址列表 -->
			<scroll-view scroll-y class="address-scroll" :class="{ 'has-list': addressList.length }"
				v-if="addressList.length > 0 && !hasSearchKeyword">
				<view class="address-section">
					<view class="section-label">收货地址</view>
					<view class="address-list">
						<view class="address-card" v-for="(item, index) in addressList" :key="item.id || index"
							:class="{ 'is-default': item.isDefault, 'is-open': item.translateX < -50 }">
							<!-- 操作按钮层 - 在底层 -->
							<view class="slide-actions">
								<view class="slide-btn default" @click="setDefaultAddress(item.id, index)" v-if="!item.isDefault">
									<uni-icons type="checkbox-filled" size="20" color="#fff"></uni-icons>
									<text class="slide-btn-text">默认</text>
								</view>
								<view class="slide-btn edit" @click="goEditAddress(item, index)">
									<uni-icons type="compose" size="20" color="#fff"></uni-icons>
									<text class="slide-btn-text">编辑</text>
								</view>
								<view class="slide-btn delete" @click="deleteAddress(item.id, index)">
									<uni-icons type="trash-filled" size="20" color="#fff"></uni-icons>
									<text class="slide-btn-text">删除</text>
								</view>
							</view>

							<!-- 地址内容层 - 在上层，可滑动 -->
							<view class="card-content" @touchstart="touchStart($event, index)" @touchmove="touchMove($event, index)"
								@touchend="touchEnd($event, index)" @click="handleCardClick(item)"
								:style="{ transform: `translateX(${item.translateX || 0}px)` }">
								<view class="card-main">
									<!-- 地址（第一行，大字体） -->
									<view class="address-row">
										<text
											class="address-text">{{ item.province }}{{ item.city }}{{ item.area }}{{ item.detailAddress }}</text>
									</view>

									<!-- 姓名+电话（第二行） -->
									<view class="user-row">
										<text class="user-name">{{ item.receiver }}</text>
										<text class="user-phone">{{ item.phone }}</text>
										<text class="default-badge" v-if="item.isDefault">默认</text>
									</view>
								</view>

								<view class="drag-hint">
									<uni-icons type="left" size="14" color="#ccc"></uni-icons>
								</view>
							</view>
						</view>

						<view class="list-tips">左滑地址卡片可编辑或删除</view>
						<view class="list-bottom"></view>
					</view>
				</view>
			</scroll-view>

			<view class="default-address-info" v-if="hasSearchKeyword">
				<view class="search-box">
					<text class="section-label">我的收货地址</text>
				</view>
				<view class="card-main">
					<!-- 地址（第一行，大字体） -->
					<view class="address-row">
						<text
							class="address-text">{{ defaultAddress.province }}{{ defaultAddress.city }}{{ defaultAddress.area }}{{ defaultAddress.detailAddress }}</text>
					</view>

					<!-- 姓名+电话（第二行） -->
					<view class="user-row">
						<text class="user-name">{{ defaultAddress.receiver }}</text>
						<text class="user-phone">{{ defaultAddress.phone }}</text>
						<text class="default-badge" v-if="defaultAddress.isDefault">默认</text>
					</view>
				</view>
			</view>
			<!-- 搜索结果 -->
			<view class="search-results" v-if="hasSearchKeyword">
				<view class="search-list">
			 
					<!-- 搜索结果列表 -->
					<view class="search-item" v-for="(item, index) in searchResults" :key="item.id"
						@click="selectSearchResult(item)">
						<view class="search-info">
							<view class="search-name">
								<text v-for="(part, idx) in highlightText(item.name)" :key="idx"
									:style="{ color: part.highlight ? '#ff6000' : '#333' }">{{ part.text }}</text>
							</view>
							<text class="search-address">{{ item.cityname }}{{ item.adname }}{{ item.address }}</text>
						</view>
					</view>

					<!-- 查看更多地址 -->
					<view class="search-item more-address" v-if="addressList.length > 0" @click="goMoreAddress">
						<view class="more-info">
							<text class="more-text">查看更多地址</text>
							<uni-icons type="right" size="20" color="#999" />
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-if="addressList.length === 0 && !hasSearchKeyword">
				<view class="empty-icon">
					<uni-icons type="location" size="80" color="#ccc" />
				</view>
				<text class="empty-text">暂无收货地址</text>
			</view>

			<!-- 底部操作栏 -->
			<view class="bottom-bar" v-if="!hasSearchKeyword">
				<view class="bottom-btn add" @click="goAddAddress">
					<text>新增收货地址</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentCity: '北京市',
				searchKeyword: '',
				searchResults: [],
				currentLocation: '',
				addressList: [],
				startX: 0,
				startY: 0,
				movingIndex: -1,
				slideMaxWidth: 180
			};
		},

		computed: {
			hasSearchKeyword() {
				return this.searchKeyword && this.searchKeyword.trim().length > 0;
			},

			defaultAddress() {
				return this.addressList.find(item => item.isDefault) || this.addressList[0] || null;
			}
		},

		onLoad() {
			this.loadAddressList();
			this.getCurrentLocation();
		},

		onShow() {
			this.loadAddressList();
		},

		methods: {
			goBack() {
				uni.switchTab({
					url: '/pages/home/home'
				});
			},

			closeAllSwipe() {
				this.addressList.forEach(item => {
					if (item.translateX && item.translateX !== 0) {
						this.$set(item, 'translateX', 0);
					}
				});
				this.movingIndex = -1;
			},

			goCitySelect() {
				uni.navigateTo({
					url: '/pages/home/city'
				});
			},

			onSearchInput() {
				if (this.searchKeyword.trim().length >= 2) {
					this.doSearch();
				} else {
					this.searchResults = [];
				}
			},

			async doSearch() {
				const keyword = this.searchKeyword.trim();
				if (!keyword || keyword.length < 2) {
					this.searchResults = [];
					return;
				}

				try {
					const res = await this.$request.post(this.$apis.common.searchAddress, {
						keyword: keyword,
						city: this.currentCity
					});

					if (res.success && res.result) {
						const resultObj = res.result;
						const results = [];
						for (const key in resultObj) {
							if (resultObj.hasOwnProperty(key)) {
								const item = resultObj[key];
								results.push({
									id: String(key),
									name: item.name || '',
									address: item.address || item.formatted_address || '',
									type: item.type || 'community',
									lat: item.lat || item.latitude,
									lng: item.lng || item.longitude,
									cityname: item.cityname || '',
									adname: item.adname || ''
								});
							}
						}
						this.searchResults = results;
					} else {
						this.searchResults = [];
					}
				} catch (error) {
					console.error('搜索地址失败:', error);
					this.searchResults = [];
				}
			},

			clearSearch() {
				this.searchKeyword = '';
				this.searchResults = [];
			},

			highlightText(text) {
				if (!this.searchKeyword || !text) {
					return [{
						text: text || '',
						highlight: false
					}];
				}

				const keyword = this.searchKeyword.trim();
				const regex = new RegExp(`(${keyword})`, 'gi');
				const parts = text.split(regex);

				return parts.map(part => ({
					text: part,
					highlight: regex.test(part)
				}));
			},

			selectSearchResult(item) {
				uni.setStorageSync('locationInfo', {
					name: item.name + ' ' + item.address,
					lat: parseFloat(item.lat),
					lng: parseFloat(item.lng)
				});
				uni.setStorageSync('lastLocation', {
					lat: parseFloat(item.lat),
					lng: parseFloat(item.lng)
				});
				uni.showToast({
					title: '已切换收货地址',
					icon: 'success'
				});
				setTimeout(() => {
					this.goBack();
				}, 1500);
			},

			selectLocation() {
				if (this.currentLocation) {
					uni.setStorageSync('locationInfo', {
						name: this.currentLocation,
						lat: null,
						lng: null
					});
					uni.showToast({
						title: '已切换收货地址',
						icon: 'success'
					});
					setTimeout(() => {
						this.goBack();
					}, 1500);
				}
			},

			goMoreAddress() {
				this.searchKeyword = '';
				this.searchResults = [];
			},

			getCurrentLocation() {
				uni.getLocation({
					type: 'gcj02',
					success: (res) => {
						this.$request.post(this.$apis.common.getAddressByLatLng, {
							lat: res.latitude,
							lng: res.longitude
						}).then((res) => {
							if (res.success) {
								this.currentLocation = res.result.address;
							}
						}).catch(() => {
							this.currentLocation = '获取定位失败';
						});
					},
					fail: () => {
						this.currentLocation = '获取定位失败';
					}
				});
			},

			reLocate() {
				this.getCurrentLocation();
			},

			async loadAddressList() {
				try {
					const res = await this.$request.post(this.$apis.user.getAddressList);
					if (res.success && res.result) {
						this.addressList = res.result.map(item => ({
							...item,
							translateX: 0
						}));
					}
				} catch (error) {
					console.error('获取地址列表失败:', error);
					this.addressList = [];
				}
			},

			goEditAddress(item, index) {
				this.$set(this.addressList[index], 'translateX', 0);
				setTimeout(() => {
					uni.navigateTo({
						url: `/pages/user/address/edit?addressId=${item.id}`
					});
				}, 300);
			},

			goAddAddress() {
				uni.navigateTo({
					url: '/pages/user/address/edit'
				});
			},

			touchStart(e, index) {
				const touch = e.touches[0];
				this.startX = touch.clientX;
				this.startY = touch.clientY;
				this.movingIndex = index;

				this.addressList.forEach((item, i) => {
					if (i !== index && item.translateX !== 0) {
						this.$set(item, 'translateX', 0);
					}
				});
			},

			touchMove(e, index) {
				if (this.movingIndex !== index) return;

				const touch = e.touches[0];
				const diffX = touch.clientX - this.startX;
				const diffY = touch.clientY - this.startY;

				if (Math.abs(diffY) > Math.abs(diffX)) return;

				const maxSlide = 180;
				let translateX = Math.max(-maxSlide, Math.min(0, diffX));

				this.$set(this.addressList[index], 'translateX', translateX);
			},

			touchEnd(e, index) {
				if (this.movingIndex !== index) return;

				const item = this.addressList[index];
				const maxSlide = 180;

				if (item.translateX < -maxSlide / 2) {
					this.$set(item, 'translateX', -maxSlide);
				} else {
					this.$set(item, 'translateX', 0);
				}

				this.movingIndex = -1;
			},

			handleCardClick(item) {
				this.selectAddress(item);
			},

			selectAddress(item) {
				if (item.translateX && item.translateX < -30) {
					this.$set(item, 'translateX', 0);
					return;
				}

				if (item.latitude && item.longitude) {
					uni.setStorageSync('locationInfo', {
						name: item.detailAddress || item.address,
						lat: parseFloat(item.latitude),
						lng: parseFloat(item.longitude)
					});
					uni.setStorageSync('lastLocation', {
						lat: parseFloat(item.latitude),
						lng: parseFloat(item.longitude)
					});
					uni.showToast({
						title: '已切换收货地址',
						icon: 'success'
					});
					setTimeout(() => {
						const pages = getCurrentPages();
						if (pages.length > 1) {
							uni.navigateBack();
						} else {
							uni.switchTab({
								url: '/pages/home/home'
							});
						}
					}, 1500);
				} else {
					uni.setStorageSync('locationInfo', {
						name: item.detailAddress || item.address,
						lat: null,
						lng: null
					});
					uni.showToast({
						title: '已切换收货地址',
						icon: 'success'
					});
					setTimeout(() => {
						this.goBack();
					}, 1500);
				}
			},

			async setDefaultAddress(id, index) {
				try {
					const res = await this.$request.post(this.$apis.user.setDefaultAddress, {
						addressId: id
					});
					if (res.success) {
						this.addressList.forEach((item, i) => {
							this.$set(item, 'isDefault', i === index);
							this.$set(item, 'translateX', 0);
						});
						uni.showToast({
							title: '已设为默认地址',
							icon: 'success'
						});
					}
				} catch (error) {
					console.error('设置默认地址失败:', error);
					uni.showToast({
						title: '设置失败',
						icon: 'none'
					});
				}
			},

			async deleteAddress(id, index) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这个地址吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								const result = await this.$request.post(this.$apis.user.deleteAddress, {
									addressId: id
								});
								if (result.success) {
									this.addressList.splice(index, 1);
									uni.showToast({
										title: '删除成功',
										icon: 'success'
									});
								}
							} catch (error) {
								console.error('删除地址失败:', error);
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								});
							}
						}
					}
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.address-page {
		min-height: 100vh;
		background: #f5f6f7;
	}

	.nav-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 88rpx;
		background: #fff;
		padding: 0 30rpx;
		padding-top: env(safe-area-inset-top);

		.nav-left {
			display: flex;
			align-items: center;
			gap: 20rpx;
		}

		.nav-back {
			width: 60rpx;
			height: 60rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.back-icon {
			width: 36rpx;
			height: 36rpx;
		}

		.nav-title {
			font-size: 34rpx;
			font-weight: 500;
			color: #333;
		}
	}

	.page-content {
		padding-top: calc(var(--status-bar-height) + 88rpx + 100rpx);
	}

	.search-section {
		position: fixed;
		top: calc(var(--status-bar-height) + 88rpx);
		left: 0;
		right: 0;
		z-index: 99;
		display: flex;
		gap: 20rpx;
		padding: 20rpx 30rpx;
		background: #fff;

		.city-select {
			display: flex;
			align-items: center;
			gap: 8rpx;
			height: 72rpx;
			flex-shrink: 0;

			.city-name {
				font-size: 28rpx;
				color: #333;
			}

			.city-arrow {
				width: 24rpx;
				height: 24rpx;
			}
		}

		.search-box {
			flex: 1;
			display: flex;
			align-items: center;
			gap: 16rpx;
			padding: 0 24rpx;
			height: 72rpx;
			background: #f5f6f7;

			.search-input {
				flex: 1;
				font-size: 28rpx;
				background: transparent;
			}

			.search-placeholder {
				color: #999;
			}

			.search-clear {
				width: 40rpx;
				height: 40rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}

	.section-label {
		font-size: 28rpx;
		color: #999;
		margin-bottom: 16rpx;
	}

	.location-section {
		padding: 20rpx 30rpx;
		background: #fff;
		margin-bottom: 20rpx;


		.location-item {
			display: flex;
			align-items: center;
			padding: 16rpx 0;

			.location-icon {
				width: 28rpx;
				height: 28rpx;
			}

			.location-name {
				flex: 1;
				font-size: 30rpx;
				color: #333;
				margin-left: 12rpx;
			}

			.re-locate {
				font-size: 28rpx;
				color: #ff6000;
				font-weight: 500;
			}
		}
	}

	.address-scroll {
		&.has-list {
			max-height: calc(100vh - 200rpx - var(--status-bar-height));
		}
	}

	.address-section {
		.section-label {
			font-size: 28rpx;
			color: #999;
			margin-bottom: 16rpx;
			padding: 20rpx 30rpx 0;
		}
	}

	.address-list {
		padding: 0;

		.address-card {
			position: relative;
			margin-bottom: 0;
			border-radius: 0;
			overflow: hidden;
			background: transparent;

			&.is-default {}

			.slide-actions {
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				display: flex;
				align-items: stretch;
				z-index: 1;

				.slide-btn {
					width: 120rpx;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					gap: 8rpx;

					&.default {
						background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
					}

					&.edit {
						background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
					}

					&.delete {
						background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
						border-top-right-radius: 20rpx;
						border-bottom-right-radius: 20rpx;
					}

					&-text {
						font-size: 22rpx;
						color: #fff;
						font-weight: 500;
					}
				}
			}

			.card-content {
				position: relative;
				z-index: 2;
				width: 100%;
				background: #fff;
				border-radius: 0;
				padding: 30rpx;
				display: flex;
				align-items: flex-start;
				justify-content: space-between;
				min-width: 0;
				transition: transform 0.3s ease;
			}

			.card-main {
				flex: 1;
				min-width: 0;
			}

			.address-row {
				margin-bottom: 12rpx;
			}

			.address-text {
				flex: 1;
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
				line-height: 1.5;
				word-break: break-all;
			}

			.user-row {
				display: flex;
				align-items: baseline;
				gap: 16rpx;
			}

			.user-name {
				font-size: 26rpx;
				color: #666;
			}

			.user-phone {
				font-size: 26rpx;
				color: #666;
			}

			.default-badge {
				background: #fff0e8;
				color: #ff6000;
				font-size: 22rpx;
				padding: 4rpx 12rpx;
				border-radius: 4rpx;
				margin-left: 16rpx;
				flex-shrink: 0;
			}

			.drag-hint {
				margin-left: 16rpx;
				opacity: 0.5;
			}
		}

		.list-tips {
			text-align: center;
			font-size: 24rpx;
			color: #999;
			padding: 20rpx 0;
		}

		.list-bottom {
			height: 20rpx;
		}
	}

	.default-address-info {
		background: #fff;
		padding: 20rpx 30rpx;
		margin-bottom: 20rpx;

		.search-box {
			font-size: 28rpx;
			color: #999;
			margin-bottom: 24rpx;
		}

		.search-address {
			font-size: 24rpx;
			color: #999;
			word-break: break-all;
		}
		.card-main {
			flex: 1;
			min-width: 0;
		}
		
		.address-row {
			margin-bottom: 12rpx;
		}
		
		.address-text {
			flex: 1;
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
			line-height: 1.5;
			word-break: break-all;
		}
		
		.user-row {
			display: flex;
			align-items: baseline;
			gap: 16rpx;
		}
		
		.user-name {
			font-size: 26rpx;
			color: #666;
		}
		
		.user-phone {
			font-size: 26rpx;
			color: #666;
		}
		
		.default-badge {
			background: #fff0e8;
			color: #ff6000;
			font-size: 22rpx;
			padding: 4rpx 12rpx;
			border-radius: 4rpx;
			margin-left: 16rpx;
			flex-shrink: 0;
		}
		
		.drag-hint {
			margin-left: 16rpx;
			opacity: 0.5;
		}
	}

	.search-results {
		background: #fff;
		padding: 20rpx;
		margin-bottom: 20rpx;

		.section-label {
			font-size: 28rpx;
			color: #999;
			margin-bottom: 16rpx;
		}

		.search-list {
			.search-item {
				display: flex;
				align-items: center;
				padding: 20rpx 0;
				border-bottom: 1rpx solid #f5f5f5;

				&:last-child {
					border-bottom: none;
				}

				&.more-address {
					justify-content: center;
					background: #fafafa;
					margin: 16rpx -20rpx -20rpx;
					padding: 24rpx 20rpx;
					border-radius: 0 0 16rpx 16rpx;

					.more-info {
						display: flex;
						align-items: center;
						gap: 8rpx;
					}

					.more-text {
						font-size: 28rpx;
						color: #666;
					}
				}

				.search-info {
					flex: 1;
					margin-left: 12rpx;

					.search-name {
						font-size: 30rpx;
						display: block;
						margin-bottom: 8rpx;
						font-weight: bold;
					}

					.search-address {
						font-size: 24rpx;
						color: #999;
						word-break: break-all;
					}
				}
			}
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;

		.empty-icon {
			width: 120rpx;
			height: 120rpx;
			margin-bottom: 20rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.empty-text {
			font-size: 28rpx;
			color: #999;
		}
	}

	.bottom-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		background: #fff;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

		.bottom-btn {
			height: 88rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 44rpx;

			&.add {
				background: linear-gradient(135deg, #ff6000 0%, #ff8c42 100%);
				color: #fff;
				font-size: 32rpx;
				font-weight: 500;
			}
		}
	}
</style>