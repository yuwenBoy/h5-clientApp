<template>
	<scroll-view class="fast-tab"
		:style="{
			'height':!isNaN(height) ? (height + 15) + 'rpx' : height
		}" 	
		:scroll-x = "!flex"
		:scroll-left="scrollLeft"
		@scroll="scrollMove"
		scroll-with-animation
	>
		<view class="tabBox"
		  :class="{'flex':flex}"
			:style="{
				'width':'90%', 'height':!isNaN(height) ? height + 'rpx' : height,  'margin': 'auto'
			}" 
		>
			<view class="tabItem" 
				:id="'tab'+ genId" 
				:class="(activeIndex === key ? 'active' : '')"
				v-for="(item,key) in list"
				:key="key"
				:style="{
					'height':!isNaN(height) ? height + 'rpx' : height,
					'font-size':!isNaN(size) ? size + 'rpx' : size,
					'font-weight':activeIndex === key && bold ? 'bold' : '400',
					'padding':!isNaN(padding) ? padding + 'rpx' : padding,
				}" 
				@tap="trigger(key,item)"
			>
				<view class="line"
					v-if="!((activeIndex + 1) === key)"
					:style="{
						'height': !isNaN(height) ? (height/2) + 'rpx' : (height /2)
					}"
				></view>
				<text :style="{
					'transform':activeIndex === key ? `scale(${scale})` : `scale(1)`
				}
				">{{item[label]}}</text>
			</view>
		</view>
	</scroll-view>
</template>

<script>
  export default {
    name: 'fast-tab',
    components:{},
    props:{
      /** tab数据 **/
			list:{
				type:Array,
				default(){
					return []
				}
			},
			/** 激活项的索引 **/
			activeIndex:{
				type:Number,
				default:0
			},
			/** label字段 **/
			label:{
				type:String,
				default:"label"
			},
			/** 左右间距 **/
			padding:{
				type:[Number,String],
				default:18
			},
			/** 组件高度 **/
			height:{
				type:[Number,String],
				default:60
			},
			/** 默认颜色 **/
			color:{
				type:String,
				default:'#16171C'
			},
			/** 激活颜色 **/
			activeColor:{
				type:String,
				default:'#F22626'
			},
			/** 激活后的缩放倍数 **/
			scale:{
				type:Number,
				default:1
			},
			/** flex全铺布局 **/
			flex:Boolean,
			/** 字号 **/
			size:{
				type:[Number,String],
				default:28
			},
			/** 字号加粗 **/
			bold:Boolean,
    },
    data () {
      return {
				scrollLeft:0,
				tabWidthList:[],
				totalWidth:-1,
				moveParams: {
					scrollLeft: 0
				},
				genId:Number(Math.random().toString().substr(3,10) + Date.now()).toString(36)
      }
    },
    methods:{
			unitInterTrans(...params){
				let _number = parseFloat(params[0]);
				if(params[1] === 'rpx'){
					return _number * 750 / uni.getSystemInfoSync().windowWidth;
				}
				if(params[1] === 'px'){
					return _number / 750 * uni.getSystemInfoSync().windowWidth;
				}
			},
			getRect(ele) {
				let that = this;
				uni.createSelectorQuery().in(this).select(ele).boundingClientRect(function (rect) {
					that.moveParams.subLeft = rect.left;
					that.moveParams.subHalfWeight = rect.width / 2;
					that.moveParams.screenHalfWeight = uni.getSystemInfoSync().windowWidth / 2;
					that.moveTo();
				}).exec()
			},
			moveTo(){
				let subLeft = this.moveParams.subLeft;
				let screenHalfWeight = this.moveParams.screenHalfWeight;
				let subHalfWeight = this.moveParams.subHalfWeight;
				let scrollLeft = this.moveParams.scrollLeft;
				let distance = subLeft - screenHalfWeight + subHalfWeight;
				this.scrollLeft = scrollLeft + distance;
			},
			scrollMove(e) {
				this.moveParams.scrollLeft = e.detail.scrollLeft;
			},
			toItem(){
				// this.getRect('.tab'+this.genId+this.activeIndex);
				this.totalWidth = this.tabWidthList.slice(0,this.activeIndex).reduce((prev,item)=>{
					return prev + item;
				},0);
				this.totalWidth = this.totalWidth + ((this.tabWidthList[this.activeIndex] - this.unitInterTrans(this.lineWidth,'px')) / 2);
			},
			trigger(key,item){
				this.$emit('update:activeIndex',key);
				this.$emit('on-change',key,item);
			}
    },
    computed:{

    },
    filters:{

    },
    watch:{
			activeIndex(){
				this.toItem();
			}
    },
    created(){
      
    },
    mounted(){
			let that = this;
			uni.createSelectorQuery().in(this).selectAll('#tab'+this.genId).boundingClientRect(function (rect) {
				that.tabWidthList = rect.reduce((prev,item)=>{
					return [...prev,...[item.width]];
				},[])
				that.toItem();
			}).exec()
    },
    activated(){
			
    }
  }
</script>

<style scoped lang="scss">
  .fast-tab{
		box-sizing: border-box;
		background-color: white;
		.tabBox{
			white-space: nowrap;
			position: relative;
			border-top-left-radius: 30upx;
			border-top-right-radius: 30upx;
			border-bottom-left-radius: 30upx;
			border-bottom-right-radius: 30upx;
			background-color: #f5f6f5;
			&.flex{
				width: 100%;
				display: flex;
				align-items: center;
				justify-content: space-between;
				.tabItem{
					flex: 1;
					position: relative;
					border-top-left-radius: 30upx;
					border-top-right-radius: 30upx;
					border-bottom-left-radius: 30upx;
					border-bottom-right-radius: 30upx;
					
					&.active {
						background: linear-gradient(to right, #00a85f, #2dd38c);
						color: #fff;
						transition: all 0.2s;
						
						.line { display: none; }
					}
					&:first-child .line {
						display: none;
					}
					.line {
						position: absolute;
						left: 0;
						width: 1rpx;
						height: 30rpx;
						background-color: #d0d0d0;
					}
				}
			}
			.tabItem{
				display: inline-flex;
				white-space: nowrap;
				align-items: center;
				transition: all 0.2s;
				justify-content: center;
				padding-top: 0rpx !important;
				padding-bottom: 0rpx !important;
			}

		}
  }
</style>