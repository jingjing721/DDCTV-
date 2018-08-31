import util from '../../utils/util.js';
Page({
    data:{
        currentList:[],       //当天列表
        historyList:[],       //历史列表
        sessionId:'',         //若sessionId值为空，则没登录，否则已登录
        myDate:+new Date(),   //请求日期
        init:true,
        indexId:0,
        invite:'',            //邀请人用户ID
        userId:'',            //当前用户ID
        mark:false,           //选择发给朋友，还是朋友圈
        mark2:false,          //显示保存本地图片的弹窗
        picUrl:'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',            //弹窗图片
        lastDay:false,        //控制是否显示昨日领券弹窗
        bind:false,           //是否显示绑定图片弹窗
        status:1,             //验证码发送状态
        timer:60,             //倒计时剩余时间
        alert:1,
        phone:'',             //手机号码
        randCode:'',          //验证码
        shareimageUrl:'',     //分享图片URL
        sharePath:'/pages/index/index',//分享路径
        shareTitle:'DDCTV',
    },
    showShareBtn2(e){
        //显示分享图片
        let self = this;
        self.setData({
            mark:true
        })
        let id = e.currentTarget.dataset.id;
        let _item = this.data.currentList.filter(item => item.id == id);
        if(_item.length > 0){
            _item = _item[0]
        }else{
            _item = this.data.historyList.filter(item => item.id == id)[0]
        }
        let sharUrl;
        let businessCategoryId = _item.businessCategoryId;
        if(_item.type == 1){
            //图文
            sharUrl = 'pages/v-detail/v-detail?id='+id+'&businessCategoryId='+businessCategoryId;
        }else if(_item.type == 2){
            //菜谱
            sharUrl = 'pages/c-detail/c-detail?id='+id+'&businessCategoryId='+businessCategoryId;
        }
        self.setData({
            shareimageUrl:_item.smallPic,
            shareTitle:_item.title,
            sharePath:sharUrl,
            picUrl:''
        })
        wx.showToast({
            title:'',
            icon:'loading',
            duration:15000
        })
        util.fetch(util.ajaxUrl+'wechat/generate',{
            businessCategoryId:businessCategoryId,
            contentId:id,
            path:_item.type == 1?'pages/v-detail/v-detail':'pages/c-detail/c-detail'
        }).then(res => {
            wx.hideToast();
            if(res && res.code == 0){
                self.setData({
                    picUrl:res.data
                })
            }
        })
    },
    hideShareBtn(){
        //隐藏悬浮窗
        this.setData({
            mark:false
        })
    },
    showShareBtn(e){
        //是否显示分享按钮
        let self = this;
        self.setData({
            mark:self.data.mark?false:true
        })
        if(e && e.currentTarget.dataset.id){
            let id = e.currentTarget.dataset.id;
            let businessCategoryId = e.currentTarget.dataset.businesscategoryid;
            let _item = this.data.currentList.filter(item => item.id == id);
            if(_item.length > 0){
                _item = _item[0]
            }else{
                _item = this.data.historyList.filter(item => item.id == id)[0]
            }
            let sharUrl;
            if(_item.type == 1){
                //图文
                sharUrl = 'pages/v-detail/v-detail?id='+id+'&businessCategoryId='+businessCategoryId;
            }else if(_item.type == 2){
                //菜谱
                sharUrl = 'pages/c-detail/c-detail?id='+id+'&businessCategoryId='+businessCategoryId;
            }
            self.setData({
                shareimageUrl:_item.smallPic,
                shareTitle:_item.title,
                sharePath:sharUrl
            })
        }else{
            self.setShareImgUrl();
        }
    },
    onShareAppMessage(){
        let self = this;
        //转发分享
        return {
            title:self.data.shareTitle,
            path:self.data.sharePath,
            imageUrl:self.data.shareimageUrl
        }
    },
    setShareImgUrl(){
        //取第一个图片作为分享的图片
        let self = this;
        let list = self.data.currentList.length>0?self.data.currentList:self.data.historyList;
        list = list.filter(item => item.smallPic);
        if(list.length > 0){
            self.setData({
                shareimageUrl:list[0].smallPic,
                shareTitle:'DDCTV',
                sharePath:'/pages/index/index'
            })
        }
    },
    onReachBottom(){
        //页面滚动到底部，加载下一页
        let self = this;
        self.setData({
            init:false
        })
        if(self.data.myDate) self.init();
    },
    init(){
        //页面初始化，请求每日十件
        let self = this;
        util.fetch(util.ajaxUrl+'top-content/list',{
            date:self.data.myDate,
            sessionId:self.data.sessionId
        }).then(res => {
            if(res && res.code == 0){
                if(self.data.init){
                    //当天列表
                    let currentList = [];
                    res.data.map((item,index) => {
                        self.setData({
                            indexId:self.data.indexId+1
                        })
                        item.indexId = self.data.indexId;
                        item.showVideo = false;     //默认不显示视频
                        item.videoDuration = util.changeTime(item.videoDuration);   //将视频播放时长修改为12:34格式
                        currentList.push(item)
                    })
                    self.setData({
                        currentList:currentList,
                        myDate:res.lastDate?res.lastDate:''
                    })
                }else{
                    //历史列表
                    let historyList = self.data.historyList;
                    if(res.data.length > 0){
                        //追加标题
                        let myDate = new Date(self.data.myDate);
                        let m = (() => {
                            let r = '';
                            let m = myDate.getMonth()+1;
                            switch(m){
                                case(1):r = '一';break;
                                case(2):r = '二';break;
                                case(3):r = '三';break;
                                case(4):r = '四';break;
                                case(5):r = '五';break;
                                case(6):r = '六';break;
                                case(7):r = '七';break;
                                case(8):r = '八';break;
                                case(9):r = '九';break;
                                case(10):r = '十';break;
                                case(11):r = '十一';break;
                                case(12):r = '十二';break;
                                default:r = '一';break;
                            }
                            return r
                        })()
                        historyList.push({
                            listTitle:self.data.myDate,
                            y:myDate.getFullYear(),
                            m:m,
                            d:myDate.getDate(),
                        })
                    }
                    res.data.map((item,index) => {
                        self.setData({
                            indexId:self.data.indexId+1
                        })
                        item.indexId = self.data.indexId;
                        item.showVideo = false;     //默认不显示视频
                        item.videoDuration = util.changeTime(item.videoDuration);   //将视频播放时长修改为12:34格式
                        historyList.push(item)
                    })
                    // console.log(historyList)
                    // historyList[1].title = '';
                    self.setData({
                        historyList:historyList,
                        myDate:res.lastDate?res.lastDate:''
                    })
                }
                self.setShareImgUrl();
                //若当天请求没数据，则显示前一天的 或 首次显示到页面的数据低于3条的(防止页面没法滑动)
                if((self.data.currentList.length < 3 && self.data.myDate && self.data.init) || (self.data.myDate && !self.data.init && self.data.historyList.length < 3)){
                    self.setData({
                        init:false
                    })
                    self.init()
                }
            }else{
                wx.showModal({
                    title:'温馨提示',
                    content:res.message || '未知错误'
                })
            }
        })
    },
    goHeart(e,from){
        //点赞
        let self = this;
        let id = e.currentTarget.dataset.id;
        let _filter = self.data.currentList.filter(item => item.id == id);
        if(_filter.length > 0){
            _filter = _filter[0];
        }else{
            _filter = self.data.historyList.filter(item => item.id == id)[0];
        }

        if(self.data.sessionId){
            //统计点赞
            wx.showToast({
                title:'',
                icon:'loading',
                duration:15000
            })
            //优先反应
            let currentList = self.data.currentList;
            if(!from){
                currentList.map(item => {
                    if(item.id == id){
                        if(_filter.isLike==0){
                            //点赞
                            item.isLike = 1;
                            item.likeCount++;
                            wx.reportAnalytics('like_add', {});
                        }else{
                            //取消点赞
                            item.isLike = 0;
                            item.likeCount--;
                            if(item.likeCount <= 0) item.likeCount = 0;
                            wx.reportAnalytics('like_cancel', {});
                        }
                    }
                })
                self.setData({
                    currentList:currentList
                })
            }


            let historyList = self.data.historyList;
            if(!from){
                historyList.map(item => {
                    if(item.id == id){
                        if(_filter.isLike==0){
                            //点赞
                            item.isLike = 1;
                            item.likeCount++;
                        }else{
                            //取消点赞
                            item.isLike = 0;
                            item.likeCount--;
                            if(item.likeCount <= 0) item.likeCount = 0;
                        }
                    }
                })
                self.setData({
                    historyList:historyList
                })
            }

            //提交后台
            util.getHeart(_filter.businessCategoryId,id,self.data.sessionId)
            .then(res => {
                wx.hideToast();
                if(res){
                    //点赞成功(获取真实点赞数据)
                    currentList.map(item => {
                        if(item.id == id){
                            item.isLike = res.data.isLike;
                            item.likeCount = res.data.likeCount;
                        }
                    })
                    historyList.map(item => {
                        if(item.id == id){
                            item.isLike = res.data.isLike;
                            item.likeCount = res.data.likeCount;
                        }
                    })
                    self.setData({
                        currentList:currentList,
                        historyList:historyList
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
                            // util.transform(self.data.sessionId).then(userId => {
                            //     if(userId){
                            //         self.setData({
                            //             userId:userId
                            //         })
                            //         //调用拉新接口
                            //         if(self.data.invite && self.data.userId && self.data.sessionId){
                            //             util.pullNew(self.data.sessionId,self.data.userId,self.data.invite)
                            //         }
                            //     }
                            // })
                            if(from == 1){
                                //点赞
                               self.goHeart(res,1) 
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
                                        complete(res){
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
    videoEnd(e){
        //视频播放完毕埋点
        let self = this;
        let id = e.currentTarget.dataset.id;
        let indexId = e.currentTarget.dataset.indexid;
        let currentList = self.data.currentList;
        let historyList = self.data.historyList;
        let _filter = currentList.filter(item => item.indexId == indexId);
        if(_filter.length > 0){
            _filter = _filter[0];
        }else{
            _filter = historyList.filter(item => item.indexId == indexId)[0]
        }
        wx.reportAnalytics('video_end', {
            video_name: _filter.title,
        })
        //播放组件归零
        currentList.map(item => item.showVideo = false)
        historyList.map(item => item.showVideo = false)
        self.setData({
            currentList:currentList,
            historyList:historyList,
            id:_filter.id,
            businessCategoryId:_filter.businessCategoryId
        })
        //调用优惠券
        // if(self.data.sessionId){
        //     setTimeout(() => {
        //         self.readyToCoupon();
        //     },100)
        // }
    },
    play(e){
        //是否播放
        let self = this;
        let id = e.currentTarget.dataset.id;
        let indexId = e.currentTarget.dataset.indexid;
        let currentList = this.data.currentList;
        let historyList = this.data.historyList;
        currentList.map(item => item.showVideo = item.indexId == indexId?true:false)
        historyList.map(item => item.showVideo = item.indexId == indexId?true:false)
        this.setData({
            currentList:currentList,
            historyList:historyList
        })
        //若无视频地址，则跳转
        let _filter = currentList.filter(item => item.indexId == indexId);
        if(_filter.length > 0){
            _filter = _filter[0];
        }else{
            _filter = historyList.filter(item => item.indexId == indexId)[0]
        }
        if(!_filter.video){
            this.goDetail(e)
        }else{
            self.setData({
                id:_filter.id,
                businessCategoryId:_filter.businessCategoryId
            })
            //埋点(视频开始播放)
            wx.reportAnalytics('video_begin', {
                video_name: _filter.title,
            })
        }
    },
    goDetail(e){
        //跳转到详情页
        let id = e.currentTarget.dataset.id;
        let businessCategoryId = e.currentTarget.dataset.businesscategoryid;
        let _item = this.data.currentList.filter(item => item.id == id);
        if(_item.length > 0){
            _item = _item[0]
        }else{
            _item = this.data.historyList.filter(item => item.id == id)[0]
        }
        if(_item.type == 1){
            //图文
            wx.navigateTo({
                url:'../v-detail/v-detail?id='+id+'&businessCategoryId='+businessCategoryId
            })
        }else if(_item.type == 2){
            //菜谱
            wx.navigateTo({
                url:'../c-detail/c-detail?id='+id+'&businessCategoryId='+businessCategoryId
            })
        }
    },
    goClassify(){
        //跳转到分类页面
        wx.navigateTo({
            url:'../classify/classify'
        })
    },
    refreshLikeCount(){
        //更新点赞数量
        let self = this;
        let sessionId = wx.getStorageSync('sessionId');
        if(sessionId){
            self.setData({
                sessionId:sessionId
            })
        }
        if(self.data.currentList.length > 0 || self.data.historyList.length > 0){
            let list = self.data.currentList.concat(self.data.historyList);
            let idList = [];
            list.map(item => {
                if(item.id){
                    idList.push({
                        businessCategoryId:item.businessCategoryId,
                        contentId:item.id
                    })
                }
            })
            util.fetch(util.ajaxUrl+'top-content/likeCount',{
                idList:idList,
                sessionId:self.data.sessionId
            }).then(res => {
                if(res && res.code == 0){
                    //更新list数据
                    let currentList = self.data.currentList;
                    let historyList = self.data.historyList;
                    currentList.map(item => {
                        if(item.id){
                            let _filter = res.data.filter(ele => ele.contentId == item.id)[0];
                            item.isLike = _filter.isLike;
                            item.likeCount = _filter.count;
                        }
                    })
                    historyList.map(item => {
                        if(item.id){
                            let _filter = res.data.filter(ele => ele.contentId == item.id)[0];
                            item.isLike = _filter.isLike;
                            item.likeCount = _filter.count;
                        }
                    })
                    self.setData({
                        currentList:currentList,
                        historyList:historyList
                    })
                }else{
                    wx.showModal({
                        title:'温馨提示',
                        content:res.message || '未知错误'
                    })
                }
            })
        }
    },
    refreshTen(){
        //刷新首页十见
        let self = this;
        if(self.data.currentList.length > 0){
            util.fetch(util.ajaxUrl+'top-content/list',{
                date:+new Date(),
                sessionId:self.data.sessionId
            }).then(res => {
                if(res && res.code == 0){
                    let currentList = [];
                    res.data.map((item,index) => {
                        self.setData({
                            indexId:self.data.indexId+1
                        })
                        item.indexId = self.data.indexId;
                        item.showVideo = false;     //默认不显示视频
                        item.videoDuration = util.changeTime(item.videoDuration);   //将视频播放时长修改为12:34格式
                        currentList.push(item)
                    })
                    self.setData({
                        currentList:currentList
                    })
                }else{
                    wx.showModal({
                        title:'温馨提示',
                        content:res.message || '未知错误'
                    })
                }
            })
        }
    },
    onLaunch(e){
        // console.log(e)
    },
    onShow(e){
        // console.log(e)
        //设置页面标题
        let self = this;
        wx.setNavigationBarTitle({
            title:'DDCTV'
        })
        //是否显示分享相关的提示
        let info = wx.getStorageSync('info');
        self.setData({
            info:info?0:1
        })
        wx.setStorageSync('info',1)
        self.refreshLikeCount();
        self.refreshTen();

        //从别的页面返回的时候，判断是否需要提示是否有券需要领取
        // let alertInfo = wx.getStorageSync('alertInfo');
        // let alertId = wx.getStorageSync('alertId');
        // let alertBusinessCategoryId = wx.getStorageSync('alertBusinessCategoryId');
        // if(alertInfo && alertId && alertBusinessCategoryId){
        //     self.setData({
        //         id:alertId,
        //         businessCategoryId:alertBusinessCategoryId
        //     })
        //     wx.removeStorageSync('alertInfo');
        //     wx.removeStorageSync('alertId');
        //     wx.removeStorageSync('alertBusinessCategoryId');
        //     //触发领券
        //     self.readyToCoupon();
        // }
    },
    sao(){
        wx.scanCode({
            success: (res) => {
                console.log(res)
            }
        })
    },
    onLoad(e){
        let self = this;
        //优先判断用户是否已登录
        util.isLogin().then(sessionId => {
            //若sessionId值为空，则没登录，否则已登录
            self.setData({
                sessionId:sessionId,
            })
            //判断昨天领取情况
            let indexYear = wx.getStorageSync('indexYear')
            let indexMonth = wx.getStorageSync('indexMonth')
            let indexDate = wx.getStorageSync('indexDate')
            let myDate = new Date();
            let year = myDate.getFullYear();
            let month = myDate.getMonth()+1;
            let date = myDate.getDate();
            if(!indexYear){
                //第一次请求，没缓存的情况下
                self.lastDay();
            }else{
                //有本地之前有缓存，判断今天是否已提示过
                if(indexYear != year || indexMonth != month || indexDate != date){
                    self.lastDay();
                }
            }
            //将sessionId转换为userId
            // if(sessionId){
            //     util.transform(sessionId).then(userId => {
            //         if(userId){
            //             self.setData({
            //                 userId:userId
            //             })
            //             //调用拉新接口
            //             if(self.data.invite && self.data.userId && self.data.sessionId){
            //                 util.pullNew(self.data.sessionId,self.data.userId,self.data.invite)
            //             }
            //         }
            //     })
            // }
            self.init()
        })
    },
    downLoad(){
        wx.showModal({
            title:'',
            content:'请前往应用商店下载日日煮APP',
            showCancel:false,
            confirmText:'知道了',
        })
    },
    closeLastDay(){
        //关闭弹窗
        this.setData({
            lastDay:false
        })
    },
    lastDay(){
        //获取昨日领取情况
        return
        let self = this;
        if(self.data.sessionId){
            util.fetch(util.ajaxUrl+'top-content/yesterday-reward',{
                sessionId:self.data.sessionId
            }).then(res => {
                if(res && res.code == 0){
                    self.setData({
                        lastDay:res.data.amount>0?true:false,
                        amount:res.data.amount,
                        info2:res.data.title
                    })
                    //当天不再显示
                    if(self.data.lastDay){
                        let myDate = new Date();
                        let year = myDate.getFullYear();
                        let month = myDate.getMonth()+1;
                        let date = myDate.getDate();
                        wx.setStorageSync('indexYear',year)
                        wx.setStorageSync('indexMonth',month)
                        wx.setStorageSync('indexDate',date)
                    }
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
        self.rewardInfo();
        //触发领券
        util.fetch(util.ajaxUrl+'top-content/get-reward',{
            contentId:self.data.id,
            businessCategoryId:self.data.businessCategoryId,
            sessionId:self.data.sessionId
        }).then(res => {
            if(res && res.code == 0){
                self.setData({
                    bind:true,
                    alert:2
                })
            }
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
    ctrlBox(){
        let self = this;
        self.setData({
            bind:self.data.bind?false:true,
            timer:60
        })
    },
    timer(){
        //开始倒计时
        let self = this;
        let timer = setInterval(() => {
            if(self.data.timer < 2) {
                self.setData({
                    status:2,
                    timer:60
                })
                clearInterval(timer)
            }
            self.setData({
                timer:self.data.timer-1
            })
        },1000)
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
                if(res && res.code == 1){
                    wx.showToast({
                        title:'绑定成功',
                        icon:'success',
                        duration:1500
                    })
                    //触发后台用户绑定手机号码成功
                    util.bindPhone(self.data.userId,self.data.phone,self.data.sessionId)
                    self.getCoupon();
                    self.setData({
                        status:1,
                        alert:2
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
    }
})