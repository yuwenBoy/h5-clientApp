<template>
	<view class="skeleton-screen" :class="{ active: loading }" v-if="loading">
		<slot name="skeleton"></slot>
	</view>
	<view class="skeleton-content" v-else>
		<slot></slot>
	</view>
</template>

<script>
export default {
	name: 'SkeletonScreen',
	props: {
		loading: {
			type: Boolean,
			default: true
		}
	}
}
</script>

<style lang="scss" scoped>
.skeleton-screen {
	&.active {
		animation: fadeIn 0.3s ease;
	}
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}
</style>
