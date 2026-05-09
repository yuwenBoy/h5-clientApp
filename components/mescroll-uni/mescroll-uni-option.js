// 全局配置
// mescroll-body 和 mescroll-uni 通用
const GlobalOption = {
	down: {
		// 其他down的配置参数也可以写,这里只展示了常用的配置:
		textInOffset: '下拉刷新', // 下拉的距离在offset范围内的提示文本
		textOutOffset: '松手刷新', // 下拉的距离大于offset范围的提示文本
		textLoading: '刷新中...', // 加载中的提示文本
		offset: 100, // 在列表顶部,下拉大于100px,松手即可触发下拉刷新的回调
		bgColor: 'transparent', // 下拉区域背景颜色
		textColor: '#ff6000', // 提示文字颜色
		native: false, // 是否使用系统自带的下拉刷新; 默认false; 仅在mescroll-body生效
		auto: true, // 是否自动执行下拉刷新 (默认为是)
		isLock: false, // 是否锁定下拉刷新 (默认为false)
		isBoth: true // 同时带上拉加载; 默认mutiDown为true时,isBoth为true; (适合的场景: ListView在刷新时需要同时获取列表数据)
	},
	up: {
		// 其他up的配置参数也可以写,这里只展示了常用的配置:
		textLoading: '加载中...', // 加载中的提示文本
		textNoMore: '- 已经到底了 -', // 没有更多数据的提示文本
		offset: 80, // 距底部多远时,触发upCallback
		isShow: true, // 是否显示上拉加载区域 (默认为是)
		toTop: {
			// 回到顶部按钮,需配置src才显示 (暂时禁用，因为图片不存在)
			src: '', // '/static/img/mescroll-totop.png' // 图片路径
			offset: 500, // 列表滚动多少距离才显示回到顶部按钮,默认500px
			right: 30, // 到右边的距离, 默认30rpx
			bottom: 150, // 到底部的距离, 默认150rpx
			width: 80 // 回到顶部图标的宽度, 默认80rpx
		},
		empty: {
			use: true, // 是否显示空布局
			icon: '/static/images/empty.png', // 图标路径 (建议放入static目录)
			tip: '~ 暂无数据 ~', // 提示
			btntext: '去逛逛', // 按钮文字
			btnClick: null // 按钮点击回调
		}
	}
}

export default GlobalOption
