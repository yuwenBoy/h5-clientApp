const home =[{
	path:'/pages/home/home',
	aliasPath:'/',
	name:'home',
	meta: {
		title: '首页',
		hideLoading: true
	},
},{
	path:'/pages/home/category',
	name:'category',
	meta: {
			title: '分类',
			hideLoading: true
		}
},{
	path:'/pages/home/search',
	name:'search',
	meta: {
			title: '搜索',
			hideLoading: true
		}
},{
	path:'/pages/home/myzuoye',
	name:'myzuoye',
	meta:{
		title:'我的作业'
	}
},{
	path:'/pages/home/storeDetail',
	name:'storeDetail',
	meta:{
		title:'门店详情'
	}
}]  
export default home;  