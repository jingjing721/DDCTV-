import util from '../../utils/util.js';
Page({
    data:{
        pageShow:1,         //页面是否显示 0不显示  1显示
        heart:0,            //是否已点赞
    },
    getHeart(){
        //是否点赞
        this.setData({
            heart:this.data.heart?0:1
        })
    },
    onShow(){},
    onLoad(e){
        //设置页面标题
        wx.setNavigationBarTitle({
            title:'DDCTV'
        })
    },
    onShareAppMessage(){
        //转发分享
        return {
            title:'DDCTV',
            path:'/pages/index/index'
        }
    }
})