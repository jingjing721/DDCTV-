import util from '../../utils/util.js';
Page({
    data:{
        list:[]
    },
    goDetail(e){
        //跳转到详情页
        let id = e.currentTarget.dataset.id;
        let title = e.currentTarget.dataset.title;
        wx.navigateTo({
            url:'../list/list?cateId='+id+'&title='+title
        })
    },
    init(){
        //请求详情
        let self = this;
        wx.showToast({
            title:'',
            icon:'loading',
            duration:15000
        })
        util.fetch(util.ajaxUrl+'topic/list',{sessionId:''}).then(res => {
            wx.hideToast();
            if(res && res.code == 0){
                res.data.length = 8;
                self.setData({
                    list:res.data
                })
            }else{
                wx.showModal({
                    title:'温馨提示',
                    content:res.message || '未知错误'
                })
            }
        })
    },
    onShow(){},
    onLoad(e){
        //设置页面标题
        wx.setNavigationBarTitle({
            title:'分类'
        })
        this.init();
    },
    onShareAppMessage(){
        //转发分享
        return {
            title:'DDCTV',
            path:'/pages/index/index'
        }
    }
})