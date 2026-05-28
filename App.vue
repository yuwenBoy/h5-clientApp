<script>
export default {
	onLaunch: function() {
		console.log('App Launch');
		this.loadSocketIO();
	},
	onShow: function() {
		console.log('App Show');
	},
	onHide: function() {
		console.log('App Hide');
	},
	watch: {
	},
	methods: {
		loadSocketIO() {
			// #ifdef H5
			if (typeof window !== 'undefined' && !window.io) {
				const script = document.createElement('script');
				script.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.2/socket.io.min.js';
				script.onload = () => {
					console.log('socket.io客户端加载成功');
				};
				script.onerror = () => {
					console.error('socket.io客户端加载失败');
				};
				document.head.appendChild(script);
			}
			// #endif
		}
	}
};
</script>

<style>
/*每个页面公共css */ 
	/*每个页面公共css */
	@import url("colorui/main.css");
	@import url("colorui/icon.css");
</style>
