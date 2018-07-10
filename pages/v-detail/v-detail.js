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
        bind:false,           //是否显示绑定图片弹窗
        status:1,             //验证码发送状态
        timer:60,             //倒计时剩余时间
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
    getReward(){
        //领取奖励
        let self = this;
        if(self.data.sessionId){
            util.fetch(util.ajaxUrl+'top-content/log-read',{
                contentId:self.data.id,
                businessCategoryId:self.data.businessCategoryId,
                sessionId:self.data.sessionId
            }).then(res => {
                if(res && res.code == 0){
                    console.log(res)
                }
            })
        }
    },
    onShow(){
    },
    onLoad(e){
        let self = this;
        wx.showToast({
            title:'',
            icon:'loading',
            duration:15000
        })
        self.setData({
            businessCategoryId:Number(e.businessCategoryId),
            id:Number(e.id)
        })
        util.isLogin().then(sessionId => {
            //若sessionId值为空，则没登录，否则已登录
            self.setData({
                sessionId:sessionId
            })
            //将sessionId转换为userId
            if(sessionId){
                setTimeout(() => {
                    self.readyToCoupon();
                },30000)
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
    getPhone(e){
        //获取手机号码
        let self = this;
        if(util.isPhone(e.detail.value)){
            self.setData({
                phone:e.detail.value
            })
        }
    },
    getCode(e){
        //获取验证码
        this.setData({
            randCode:e.detail.value
        })
    },
    send(){
        //发送验证码
        let self = this;
        if(self.data.phone){
            wx.showToast({
                title:'',
                icon:'loading',
                duration:15000
            })
            util.fetch(util.ajaxUrl2+'/member/smsCode',{
                mobile:self.data.phone
            }).then(res => {
                wx.hideToast();
                console.log(res)
                if(res && res.code == 1){
                    wx.showToast({
                        title:'发送成功',
                        icon:'success',
                        duration:1500
                    })
                    self.timer();
                    self.setData({
                        status:3
                    })
                }else{
                    let msg = '';
                    switch(res.code){
                        case 0:msg = '错误';break;
                        case 2:msg = '请求参数错误';break;
                        case 10005:msg = '短信发送异常';break;
                        case 10013:msg = '1分钟内只能发送一次';break;
                        default:msg = '未知错误';
                    }
                    wx.showModal({
                        title:'温馨提示',
                        content:msg
                    })
                }
            })
        }
    },
    goUpload(){
        //绑定手机号码
        let self = this;
        if(self.data.phone && self.data.randCode){
            wx.showToast({
                title:'',
                icon:'loading',
                duration:15000
            })
            util.fetch(util.ajaxUrl2+'/member/bind',{
                mobile:self.data.phone,
                smsCode:self.data.randCode,
                session:self.data.sessionId
            }).then(res => {
                wx.hideToast();
                console.log(res)
                if(res && res.code == 1){
                    wx.showToast({
                        title:'绑定成功',
                        icon:'success',
                        duration:1500
                    })
                    setTimeout(() => {
                        self.getCoupon();
                    },1500)
                    self.setData({
                        status:1
                    })
                }else{
                    let msg = '';
                    switch(res.code){
                        case 0:msg = '错误';break;
                        case 2:msg = '请求参数错误';break;
                        case 10000:msg = '用户未登录';break;
                        case 10001:msg = '手机号已被注册';break;
                        case 10002:msg = '手机号已被绑定';break;
                        case 10004:msg = '验证码错误';break;
                        case 10010:msg = '用户已经绑定过手机';break;
                        default:msg = '未知错误';
                    }
                    wx.showModal({
                        title:'温馨提示',
                        content:msg
                    })
                }
            })
        }
    },
    ctrlBox(){
        let self = this;
        self.setData({
            bind:self.data.bind?false:true
        })
    },
    timer(){
        //开始倒计时
        let self = this;
        let timer = setInterval(() => {
            if(self.data.timer < 1) {
                self.setData({
                    status:2
                })
                clearInterval(timer)
            }
            self.setData({
                timer:self.data.timer-1
            })
        },1000)
    },
    getCoupon(){
        //记录阅读信息
        let self = this;
        util.fetch(util.ajaxUrl+'top-content/log-read',{
            contentId:self.data.id,
            businessCategoryId:self.data.businessCategoryId,
            sessionId:self.data.sessionId
        }).then(res => {
            if(res && res.code == 0){
                // console.log(res)
            }
        })
        //触发领券
        util.fetch(util.ajaxUrl+'top-content/get-reward',{
            contentId:self.data.id,
            businessCategoryId:self.data.businessCategoryId,
            sessionId:self.data.sessionId
        }).then(res => {
            if(res && res.code == 0){
                wx.showToast({
                    title:'领取成功',
                    icon:'success',
                    duration:1500
                })
            }
        })
    },
    downLoad(){
        wx.showModal({
            title:'温馨提示',
            content:'请前往应用商店下载日日煮APP'
        })
    },
    rewardInfo(){
        //查询奖励信息
        let self = this;
        util.fetch(util.ajaxUrl+'top-content/reward-info',{}).then(res => {
            if(res && res.code == 0){
                self.setData({
                    amount:res.data.amount,
                    info2:res.data.title
                })
            }
        })
    },
    readyToCoupon(){
        //判断否可去领券
        let self = this;
        if(self.data.sessionId){
            util.isBind(self.data.sessionId)
            .then(res => {
                if(res){
                    //已绑定手机号码
                    self.getCoupon();
                }else{
                    //弹窗需要绑定手机号码
                    self.rewardInfo();
                    self.setData({
                        bind:true
                    })
                }
            })
        }
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
            //生成图片
            wx.showToast({
                title:'',
                icon:'loading',
                duration:15000
            })
            util.createQRcode(self.data.sessionId,self.data.userId)
            .then(picUrl => {
                wx.hideToast();
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