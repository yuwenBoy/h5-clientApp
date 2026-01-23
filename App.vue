<script>
export default {
	onLaunch: function() {
		console.log('App Launch');

		// setTimeout(() => {
		// 	uni.setTabBarBadge({
		// 		index: 4,
		// 		text: '11'
		// 	});
		// 	uni.showTabBarRedDot({
		// 		index: 3
		// 	});
		// }, 1000);
	},
	onShow: function() {
		console.log('App Show');
	},
	onHide: function() {
		console.log('App Hide');
	},
	watch: {
	}
};
</script>

<style>
/*每个页面公共css */ 
	/*每个页面公共css */
	@import url("colorui/main.css");
	@import url("colorui/icon.css");
</style>
