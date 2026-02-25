<template>
	<view>
		绑定手机号
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			canSubmit(){
				this.$router.push({	path: '/pages/order/confirm'})
			}
		}
	}
</script>

<style>

</style>
