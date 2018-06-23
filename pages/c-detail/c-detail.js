import util from '../../utils/util.js';
Page({
    data:{
        pageShown:0,         //页面是否显示 0不显示  1显示
        isLike:0,            //是否已点赞
        id:'',
        businessCategoryId:'',
        play:false,
        contentFoodList:[],
        contentDetailList:[]
    },
    getHeart(from){
        //点赞
        let self = this;
        if(self.data.sessionId){
            //先渲染页面
            if(!from){
                if(self.data.isLike){
                    //取消点赞
                    let likeCount = self.data.likeCount-1;
                    if(likeCount <= 0) likeCount = 0;
                    self.setData({
                        likeCount:likeCount,
                        isLike:0
                    })
                }else{
                    //点赞
                    self.setData({
                        likeCount:self.data.likeCount+1,
                        isLike:1
                    })
                }
            }
            //提交后台
            util.getHeart(self.data.businessCategoryId,self.data.id,self.data.sessionId)
            .then(res => {
                if(res){
                    //点赞成功(获取真实点赞数据)
                    self.setData({
                        isLike:res.data.isLike,
                        likeCount:res.data.likeCount,
                    })
                }
            })
        }
    },
    onGotUserInfo(res){
        //获取code值
        let self = this;
        wx.login({
            success(res2){
                if(res.detail.errMsg.indexOf('ok') > -1){
                    util.fetch(util.ajaxUrl2+'/mini/auth',{
                        encryptedData:res.detail.encryptedData,
                        iv:res.detail.iv,
                        code:res2.code
                    }).then(res3 => {
                        if(res3 && res3.code == 1){
                            wx.setStorageSync('sessionId',res3.data.session);
                            self.setData({
                                sessionId:res3.data.session
                            })
                            self.getHeart(1)
                        }else{
                            wx.hideToast();
                            let msg;
                            switch(res3.code){
                                case(0):msg = '获取失败，请重试';break;
                                case(2):msg = '请求参数错误';break;
                                case(10011):msg = '微信用户获取失败';break;
                                case(10012):msg = '微信用户注册失败';break;
                                default:msg = '未知错误';
                            }
                            wx.showModal({
                                title:'温馨提示',
                                content:msg
                            })
                        }
                    })
                }else{
                    wx.hideToast();
                    if(wx.getSetting){
                        wx.getSetting({
                            complete(res){
                                if(!res.authSetting['scope.userInfo']){
                                    wx.showModal({
                                        title:'温馨提示',
                                        content:'检测到您没打开授权权限，是否去设置打开？',
                                        complete(){
                                            wx.openSetting({
                                                complete(){
                                                    //重新授权
                                                    // self.onGotUserInfo()
                                                }
                                            })
                                        }
                                    })
                                }
                            }
                        })
                    }else{
                        wx.showModal({
                            title:'温馨提示',
                            content:'版本过低，请先升级微信，或删除小程序后重新扫描'
                        })
                    }
                }
            },
            fail(xhr){
                wx.hideToast();
                wx.showModal({
                    title:'温馨提示',
                    content:'授权失败，请稍后再试！'
                })
            }
        })
    },
    play(){
        if(this.data.video){
            this.setData({
                play:!this.data.play
            })
        }
    },
    init(){
        //请求详情
        let self = this;
        util.fetch(util.ajaxUrl+'top-content/view',{
            contentId:self.data.id,
            sessionId:self.data.sessionId,
            businessCategoryId:self.data.businessCategoryId
        }).then(res => {
            if(res && res.code == 0){
                if(res && res.code == 0){
                    if(res.data.contentDetailList){
                        res.data.contentDetailList.map(item => {
                            item.first = item.groupTitle.split('/')[0];
                            item.last = item.groupTitle.split('/')[1];
                        })
                    }
                    wx.setNavigationBarTitle({
                        title:res.data.title
                    })
                    self.setData({
                        smallPic:res.data.smallPic,
                        likeCount:res.data.likeCount,
                        title:res.data.title,
                        pageShown:res.data.state,
                        video:res.data.video,
                        isLike:res.data.isLike,
                        videoDuration:util.changeTime(res.data.videoDuration),
                        summary:res.data.summary,
                        contentFoodList:res.data.contentFoodList,
                        contentDetailList:res.data.contentDetailList
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
        let self = this;
        self.setData({
            businessCategoryId:Number(e.businessCategoryId),
            id:Number(e.id)
        })
        util.isLogin().then(sessionId => {
            //若sessionId值为空，则没登录，否则已登录
            self.setData({
                sessionId:sessionId
            })
            self.init()
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