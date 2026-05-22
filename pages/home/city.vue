<template>
	<view class="city-page">
		<!-- 顶部：返回 + 搜索 -->
		<view class="header-fixed">
			<view class="nav-row">
				<view class="nav-back" @click="goBack">
					<image class="back-icon" src="/static/img/back-icon.png" mode="widthFix" />
				</view>
				<view class="nav-search">
					<uni-icons type="search" size="18" color="#999" />
					<input
						class="search-input"
						v-model="searchKeyword"
						placeholder="输入城市名或拼音"
						placeholder-class="search-placeholder"
						confirm-type="search"
					/>
					<view class="search-clear" v-if="searchKeyword" @click.stop="clearSearch">
						<uni-icons type="clear" size="16" color="#999" />
					</view>
				</view>
			</view>
		</view>

		<scroll-view
			class="city-scroll"
			scroll-y
			:scroll-into-view="scrollIntoView"
			:scroll-with-animation="scrollWithAnimation"
			@scroll="onListScroll"
		>
			<!-- 热门城市（9 个） -->
			<view class="section hot-section" v-if="!isSearching && filteredHot.length">
				<view class="section-label">热门城市</view>
				<view class="hot-grid">
					<view
						class="hot-item"
						v-for="name in filteredHot"
						:key="'hot-' + name"
						:class="{ active: isSameCity(name, currentCity) }"
						@click="selectCity(name)"
					>{{ name }}</view>
				</view>
			</view>

			<!-- 字母城市列表 -->
			<view
				class="letter-section"
				v-for="group in filteredGroups"
				:key="group.letter"
				:id="'letter-' + group.letter"
			>
				<view class="letter-label">{{ group.letter }}</view>
				<view
					class="city-item"
					v-for="name in group.cities"
					:key="group.letter + '-' + name"
					:class="{ active: isSameCity(name, currentCity) }"
					@click="selectCity(name)"
				>
					<text class="city-name">{{ name }}</text>
					<uni-icons
						v-if="isSameCity(name, currentCity)"
						type="checkmarkempty"
						size="20"
						color="#ff6200"
					/>
				</view>
			</view>

			<view class="empty-tip" v-if="isSearching && !filteredGroups.length">
				<text>未找到「{{ searchKeyword }}」相关城市</text>
			</view>

			<view class="list-bottom"></view>
		</scroll-view>

		<!-- 右侧字母索引 -->
		<view
			class="letter-index"
			v-if="!isSearching && indexLetters.length"
			@touchstart.stop.prevent="onIndexTouch"
			@touchmove.stop.prevent="onIndexTouch"
			@touchend="onIndexTouchEnd"
		>
			<text
				class="index-char"
				v-for="letter in indexLetters"
				:key="letter"
				:class="{ active: activeLetter === letter }"
				@click.stop="jumpToLetter(letter)"
			>{{ letter }}</text>
		</view>

		<view class="index-tip" v-if="showIndexTip">{{ activeLetter }}</view>
	</view>
</template>

<script>
import {
	INDEX_LETTERS,
	filterCities,
	formatCityName,
	displayCityName,
	isSameCity
} from '@/utils/city-data.js';

export default {
	data() {
		return {
			searchKeyword: '',
			currentCity: '',
			selecting: false,
			scrollIntoView: '',
			scrollWithAnimation: false,
			activeLetter: '',
			showIndexTip: false,
			indexTouching: false
		};
	},

	computed: {
		isSearching() {
			return !!(this.searchKeyword && this.searchKeyword.trim());
		},
		filtered() {
			return filterCities(this.searchKeyword);
		},
		filteredHot() {
			return this.filtered.hot;
		},
		filteredGroups() {
			return this.filtered.groups;
		},
		indexLetters() {
			return this.isSearching ? [] : INDEX_LETTERS;
		}
	},

	onLoad() {
		const saved = uni.getStorageSync('currentCity');
		if (saved) {
			this.currentCity = displayCityName(saved);
		}
	},

	methods: {
		isSameCity,
		displayCityName,

		goBack() {
			const pages = getCurrentPages();
			if (pages.length <= 1) {
				uni.switchTab({ url: '/pages/home/home' });
				return;
			}
			uni.navigateBack({
				delta: 1,
				fail: () => {
					// #ifdef H5
					if (typeof history !== 'undefined' && history.length > 1) {
						history.back();
					}
					// #endif
				}
			});
		},

		clearSearch() {
			this.searchKeyword = '';
		},

		selectCity(name) {
			if (this.selecting || !name) return;
			this.selecting = true;
			const display = displayCityName(name);
			const stored = formatCityName(name);
			this.currentCity = display;
			try {
				uni.setStorageSync('currentCity', stored);
				uni.setStorageSync('locationInfo', {
					name: stored,
					city: stored,
					lat: null,
					lng: null
				});
			} catch (e) {
				console.error('保存城市失败', e);
			}
			uni.showToast({ title: `已切换到${display}`, icon: 'none', duration: 800 });
			setTimeout(() => {
				this.selecting = false;
				this.goBack();
			}, 400);
		},

		jumpToLetter(letter) {
			this.activeLetter = letter;
			this.scrollWithAnimation = true;
			this.scrollIntoView = 'letter-' + letter;
			this.$nextTick(() => {
				setTimeout(() => {
					this.scrollIntoView = '';
				}, 400);
			});
		},

		onIndexTouch(e) {
			this.indexTouching = true;
			this.showIndexTip = true;
			this.scrollWithAnimation = false;
			this.pickLetterFromTouch(e);
		},

		onIndexTouchEnd() {
			this.indexTouching = false;
			setTimeout(() => {
				this.showIndexTip = false;
			}, 280);
		},

		pickLetterFromTouch(e) {
			const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
			if (!touch) return;
			uni.createSelectorQuery().in(this).select('.letter-index').boundingClientRect((rect) => {
				if (!rect) return;
				const letters = this.indexLetters;
				const itemHeight = rect.height / letters.length;
				let index = Math.floor((touch.clientY - rect.top) / itemHeight);
				index = Math.max(0, Math.min(letters.length - 1, index));
				const letter = letters[index];
				if (letter) this.jumpToLetter(letter);
			}).exec();
		},

		onListScroll() {
			if (this.isSearching || this.indexTouching) return;
			uni.createSelectorQuery().in(this).selectAll('.letter-label').boundingClientRect((rects) => {
				if (!rects || !rects.length) return;
				const threshold = 120;
				let current = '';
				for (let i = 0; i < rects.length; i++) {
					if (rects[i].top <= threshold) {
						current = this.filteredGroups[i] ? this.filteredGroups[i].letter : '';
					}
				}
				if (current) this.activeLetter = current;
			}).exec();
		}
	}
};
</script>

<style lang="scss" scoped>
$theme: #ff6200;
$bg: #f5f5f5;
$divider: #ededed;

.city-page {
	min-height: 100vh;
	background: $bg;
}

.header-fixed {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
	background: #fff;
	padding-top: env(safe-area-inset-top);
	padding-top: constant(safe-area-inset-top);
}

.nav-row {
	display: flex;
	align-items: center;
	height: 88rpx;
	padding: 0 24rpx 0 8rpx;
	box-sizing: border-box;
}

.nav-back {
	width: 72rpx;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.back-icon {
	width: 36rpx;
	height: 36rpx;
}

.nav-search {
	flex: 1;
	min-width: 0;
	display: flex;
	align-items: center;
	height: 72rpx;
	padding: 0 24rpx;
	background: #f5f6f7;
	border-radius: 36rpx;
	box-sizing: border-box;
}

.search-input {
	flex: 1;
	min-width: 0;
	width: 0;
	margin-left: 12rpx;
	font-size: 28rpx;
	color: #333;
	height: 72rpx;
	line-height: 72rpx;
	background: transparent;
	border: none;
}

.search-placeholder {
	color: #999;
	font-size: 28rpx;
}

.search-clear {
	flex-shrink: 0;
	width: 40rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 8rpx;
}

.city-scroll {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	top: calc(env(safe-area-inset-top) + 88rpx);
	top: calc(constant(safe-area-inset-top) + 88rpx);
	background: $bg;
	box-sizing: border-box;
}

.section {
	background: #fff;
	margin-bottom: 16rpx;
	padding: 24rpx 32rpx 16rpx;
}

.section-label {
	font-size: 26rpx;
	color: #999;
	line-height: 36rpx;
	margin-bottom: 16rpx;
}

.hot-grid {
	display: flex;
	flex-wrap: wrap;
	margin: 0 -10rpx;
}

.hot-item {
	width: calc(33.333% - 20rpx);
	margin: 0 10rpx 20rpx;
	height: 72rpx;
	line-height: 72rpx;
	text-align: center;
	font-size: 28rpx;
	color: #333;
	background: #f5f5f5;
	border-radius: 8rpx;
	box-sizing: border-box;
}

.hot-item.active {
	color: $theme;
	background: #fff5ef;
}

.letter-section {
	background: $bg;
}

.letter-label {
	padding: 16rpx 32rpx 8rpx;
	font-size: 26rpx;
	color: #999;
	line-height: 36rpx;
	background: $bg;
}

.city-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 96rpx;
	padding: 0 32rpx;
	background: #fff;
	border-bottom: 1rpx solid $divider;
}

.city-item.active {
	background: #fff7f2;

	.city-name {
		color: $theme;
		font-weight: 500;
	}
}

.city-name {
	font-size: 30rpx;
	color: #333;
}

.empty-tip {
	padding: 100rpx 32rpx;
	text-align: center;
	font-size: 28rpx;
	color: #999;
}

.list-bottom {
	height: 80rpx;
}

.letter-index {
	position: fixed;
	right: 4rpx;
	top: 50%;
	transform: translateY(-42%);
	z-index: 101;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.index-char {
	font-size: 20rpx;
	color: #999;
	line-height: 28rpx;
	padding: 2rpx 6rpx;
}

.index-char.active {
	color: $theme;
	font-weight: 600;
}

.index-tip {
	position: fixed;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	width: 128rpx;
	height: 128rpx;
	line-height: 128rpx;
	text-align: center;
	background: rgba(0, 0, 0, 0.5);
	color: #fff;
	font-size: 64rpx;
	font-weight: 600;
	border-radius: 16rpx;
	z-index: 200;
	pointer-events: none;
}
</style>
