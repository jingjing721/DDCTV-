import util from '../../utils/util.js';
Page({
    data:{
        pageShown:0,         //页面是否显示 0不显示  1显示
        heart:0,            //是否已点赞
        id:'',
        businessCategoryId:'',
        play:false
    },
    getHeart(){
        //是否点赞
        this.setData({
            heart:this.data.heart?0:1
        })
    },
    play(){
        this.setData({
            play:!this.data.play
        })
    },
    init(){
        //请求详情
        let self = this;
        util.fetch(util.ajaxUrl+'top-content/view',{
            contentId:self.data.id,
            businessCategoryId:self.data.businessCategoryId
        }).then(res => {
            if(res && res.code == 0){
                if(res && res.code == 0){
                    self.setData({
                        smallPic:res.data.smallPic,
                        likeCount:res.data.likeCount,
                        title:res.data.title,
                        pageShown:res.data.state,
                        video:res.data.video,
                        videoDuration:util.changeTime(res.data.videoDuration),
                        summary:res.data.summary
                    })
                }else{
                    wx.showModal({
                        title:'温馨提示',
                        content:res.message || '未知错误'
                    })
                }
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
        this.setData({
            businessCategoryId:Number(e.businessCategoryId),
            id:Number(e.id)
        })
        this.init()
    },
    onShareAppMessage(){
        //转发分享
        return {
            title:'DDCTV',
            path:'/pages/index/index'
        }
    }
})