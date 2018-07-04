import util from '../../utils/util.js';
// let init = true;            //是否第一次请求
// let indexId = 0;
Page({
    data:{
        pageShow:1,           //页面是否显示 0不显示  1显示
        currentList:[],       //当天列表
        historyList:[],       //历史列表
        sessionId:'',         //若sessionId值为空，则没登录，否则已登录
        myDate:+new Date(),   //请求日期
        init:true,
        indexId:0,
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
                    self.setData({
                        historyList:historyList,
                        myDate:res.lastDate?res.lastDate:''
                    })
                }
                //若当天请求没数据，则显示前一天的
                if(self.data.currentList.length == 0 && self.data.myDate && self.data.init){
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
            wx.reportAnalytics('click', {
                click: 'isLike',
            });
            //优先反应
            let currentList = self.data.currentList;
            if(!from){
                currentList.map(item => {
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
                    // console.log(res)
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
        wx.login({
            success(res2){
                if(res.detail.errMsg.indexOf('ok') > -1){
                    wx.showToast({
                        title:'',
                        icon:'loading',
                        duration:15000
                    })
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
                            self.goHeart(res,1)
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
    play(e){
        //是否播放
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
    onShow(){
        //设置页面标题
        wx.setNavigationBarTitle({
            title:'DDCTV'
        })
        this.refreshLikeCount();
        this.refreshTen();
    },
    onLoad(e){
        let self = this;
        //分享进来携带的上一个用户的信息
        if(e && e.scene){
            let scene = decodeURIComponent(e.scene);
            wx.setStorageSync('uid',scene);
        }
        //优先判断用户是否已登录
        util.isLogin().then(sessionId => {
            //若sessionId值为空，则没登录，否则已登录
            self.setData({
                sessionId:sessionId
            })
            //将sessionId转换为userId
            // util.transform(sessionId).then(userId => {
            //     if(userId){
            //         self.setData({
            //             userId:userId
            //         })
            //     }
            // })
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