import util from '../../utils/util.js';
Page({
    data:{
        pageShown:0,         //页面是否显示 0不显示  1显示
        isLike:0,            //是否已点赞
        id:'',
        businessCategoryId:'',
        play:false,
        invite:'',            //邀请人用户ID
        userId:'',            //当前用户ID
        mark:false,           //选择发给朋友，还是朋友圈
        mark2:false,          //显示保存本地图片的弹窗
        picUrl:'',            //弹窗图片
    },
    getHeart(from){
        //点赞
        let self = this;
        if(self.data.sessionId){
            wx.showToast({
                title:'',
                icon:'loading',
                duration:15000
            })
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
                    wx.reportAnalytics('like_cancel', {});
                }else{
                    //点赞
                    self.setData({
                        likeCount:self.data.likeCount+1,
                        isLike:1
                    })
                    wx.reportAnalytics('like_add', {});
                }
            }
            //提交后台
            util.getHeart(self.data.businessCategoryId,self.data.id,self.data.sessionId)
            .then(res => {
                wx.hideToast();
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
        wx.showToast({
            title:'',
            icon:'loading',
            duration:15000
        })
        let from = res.target.dataset.from;     //1 点赞   2分享
        wx.login({
            success(res2){
                if(res.detail.errMsg.indexOf('ok') > -1){
                    util.fetch(util.ajaxUrl2+'/mini/auth',{
                        encryptedData:res.detail.encryptedData,
                        iv:res.detail.iv,
                        code:res2.code
                    }).then(res3 => {
                        wx.hideToast();
                        if(res3 && res3.code == 1){
                            wx.setStorageSync('sessionId',res3.data.session);
                            self.setData({
                                sessionId:res3.data.session
                            })
                            //将sessionId转换为userId
                            util.transform(self.data.sessionId).then(userId => {
                                if(userId){
                                    self.setData({
                                        userId:userId
                                    })
                                    //调用拉新接口
                                    if(self.data.invite && self.data.userId && self.data.sessionId){
                                        util.pullNew(self.data.sessionId,self.data.userId,self.data.invite)
                                    }
                                }
                            })
                            if(from == 1){
                                //点赞
                               self.getHeart(1)
                            }else{
                                //显示分享悬浮窗
                                self.showShareBtn()
                            }
                        }else{
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
                                            if(res && res.confirm){
                                                wx.openSetting({
                                                    complete(){
                                                        // self.onGotUserInfo()
                                                    }
                                                })
                                            }
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
    videoEnd(){
        //播放结束
        let self = this;
        wx.reportAnalytics('video_end', {
            video_name: self.data.title,
        })
    },
    play(){
        let self = this;
        if(this.data.video){
            this.setData({
                play:!this.data.play
            })
            //埋点(视频开始播放)
            wx.reportAnalytics('video_begin', {
                video_name: self.data.title,
            })
        }
    },
    bindplay(){
        //开始播放视频
        let self = this;
        self.timeCount = setTimeout(() => {
            //记录一下，当返回首页的时候提示
            wx.setStorageSync('alertInfo',1);
            wx.setStorageSync('alertId',self.data.id);
            wx.setStorageSync('alertBusinessCategoryId',self.data.businessCategoryId);
        },30000)
    },
    onUnload(){
        let self = this;
        if(self.timeCount){
            clearTimeout(self.timeCount);
        }
    },
    init(){
        //请求详情
        let self = this;
        util.fetch(util.ajaxUrl+'top-content/view',{
            contentId:self.data.id,
            businessCategoryId:self.data.businessCategoryId,
            sessionId:self.data.sessionId
        }).then(res => {
            wx.hideToast();
            if(res && res.code == 0){
                if(res && res.code == 0){
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
                        contentDetailList:res.data.contentDetailList,
                        contentFoodList:res.data.contentFoodList,
                        tagList:res.data.tagList
                    })
                    if(!self.data.video){
                        //没视频的时候，倒计时30s后发券
                        self.timeCount = setTimeout(() => {
                            //记录一下，当返回首页的时候提示
                            wx.setStorageSync('alertInfo',1);
                            wx.setStorageSync('alertId',self.data.id);
                            wx.setStorageSync('alertBusinessCategoryId',self.data.businessCategoryId);
                        },30000)
                    }
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
        wx.showToast({
            title:'',
            icon:'loading',
            duration:15000
        })
        self.setData({
            businessCategoryId:Number(e.businessCategoryId),
            id:Number(e.id),
            invite:e.invite
        })
        util.isLogin().then(sessionId => {
            //若sessionId值为空，则没登录，否则已登录
            self.setData({
                sessionId:sessionId
            })
            //将sessionId转换为userId
            if(sessionId){
                util.transform(sessionId).then(userId => {
                    if(userId){
                        self.setData({
                            userId:userId
                        })
                        //调用拉新接口
                        if(self.data.invite && self.data.userId && self.data.sessionId){
                            util.pullNew(self.data.sessionId,self.data.userId,self.data.invite)
                        }
                    }
                })
            }
            self.init();
        })
    },
    stop(){},
    showPic(){
        //控制是否显示朋友圈的图片
        let self = this;
        self.setData({
            mark2:self.data.mark2?false:true
        })
        if(self.data.mark2){
            self.setData({
                mark:false
            })
        }
        if(self.data.mark2 && !self.data.picUrl){
            util.createQRcode(self.data.sessionId,self.data.userId)
            .then(picUrl => {
                if(picUrl){
                    self.setData({
                        picUrl:picUrl
                    })
                }else{
                    wx.showModal({
                        title:'温馨提示',
                        content:'获取图片失败，请返回重试'
                    })
                }
            })
        }
    },
    savePic(){
        //保存图片
        let self = this;
        if(!self.data.picUrl){
            wx.showModal({
                title:'温馨提示',
                content:'请耐心等待图片生成完毕'
            })
            return
        }
        wx.showToast({
            title:'',
            icon:'loading',
            duration:15000
        })
        wx.getImageInfo({
            src:self.data.picUrl,
            success(res){
                wx.saveImageToPhotosAlbum({
                    filePath:res.path,
                    success(res){
                        wx.showToast({
                            icon:'success',
                            title:'保存成功'
                        })
                    },
                    fail(res){
                        wx.showToast({
                            icon:'success',
                            title:'保存失败'
                        })
                    },
                    complete(res){
                        self.setData({
                            mark:false,
                            mark2:false
                        })
                    }
                })
            }
        })
    },
    showShareBtn(){
        //是否显示分享按钮
        let self = this;
        self.setData({
            mark:self.data.mark?false:true
        })
    },
    onShareAppMessage(){
        //转发分享
        let self = this;
        return {
            title:self.data.title,
            path:'/pages/v-detail/v-detail?id='+self.data.id+'&businessCategoryId='+self.data.businessCategoryId+'&invite='+self.data.userId
        }
    }
})