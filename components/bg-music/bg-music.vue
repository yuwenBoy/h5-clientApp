<template>
	<!--音乐组件-->
	<view class="musicSwitch">
		<image @click="musicSwitch" class="musicImg" :class="isPlay?'active':'paused'" src="../../static/index/music.svg" mode=""></image>
	</view>
</template>
<script>
	export default {
		name: "bg-music",
		data() {
			return {
				isPlay: false
			}
		},
		activated(){
			// 获取播放状态
			this.isPlay = this.$music.music.getPlay()
		},
		methods: {
			musicSwitch() {
				console.log(this.$music)
				this.isPlay = !this.isPlay
				if (this.isPlay) {
					this.$music.music.play()
				} else {
					this.$music.music.pause()
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.musicSwitch {
		width: 70upx;
		height:  70upx;
		position: fixed;
		top: 40upx;
		right: 20upx;
		z-index: 999;
	}

	.musicSwitch image {
		width: 70upx;
		height:  70upx;
	}

	.musicImg {
		-webkit-animation: rotating 1.2s linear infinite;
		animation: rotating 1.2s linear infinite
	}
	.active {
	  animation-play-state: running;
	}
	.paused {
	  animation-play-state: paused;
	}
	
	@-webkit-keyframes rotating {
	    0% {
	        transform: rotate(0deg)
	    }
	
	    to {
	        transform: rotate(1turn)
	    }
	}
	
	@keyframes rotating {
	    0% {
	        transform: rotate(0deg)
	    }
	
	    to {
	        transform: rotate(1turn)
	    }
	}
</style>
