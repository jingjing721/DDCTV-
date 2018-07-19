import util from '../../utils/util.js';
Page({
    data:{
        pageShow:1,         //页面是否显示 0不显示  1显示
        cateId:0,           //分类ID
        list:[],
        page:1,             //页数
        next:true,          //是否可以加载下一页
        invite:'',            //邀请人用户ID
        userId:'',            //当前用户ID
        mark:false,           //选择发给朋友，还是朋友圈
        mark2:false,          //显示保存本地图片的弹窗
        picUrl:'',            //弹窗图片
        shareimageUrl:'',     //分享图片URL
        sharePath:'/pages/index/index',//分享路径
        shareTitle:'DDCTV',
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
            let _item = self.data.list.filter(item => item.id == id)[0];
            let sharUrl;
            if(_item.type == 1){
                //图文
                sharUrl = 'pages/v-detail/v-detail?id='+id+'&businessCategoryId='+businessCategoryId;
            }else if(_item.type == 2){
                //菜谱
                sharUrl = 'pages/c-detail/c-detail?id='+id+'&businessCategoryId='+businessCategoryId;
            }
            self.setData({
                sharePath:sharUrl,
                shareTitle:_item.title,
                shareimageUrl:_item.smallPic
            })
        }else{
            self.setShareImgUrl()
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
        let list = self.data.list;
        list = list.filter(item => item.smallPic);
        if(list.length > 0){
            self.setData({
                shareimageUrl:list[0].smallPic,
                sharePath:'/pages/index/index',
                shareTitle:'DDCTV'
            })
        }
    },
    onReachBottom(){
        //页面滚动到底部，加载下一页
        let self = this;
        if(self.data.next) self.init();
    },
    init(){
        //初始化页面
        let self = this;
        util.fetch(util.ajaxUrl+'topic/list-content',{
            page:self.data.page,
            rows:10,
            topcId:self.data.cateId,
            sessionId:self.data.sessionId
        }).then(res => {
            wx.hideToast();
            self.setData({
                page:self.data.page+1
            })
            if(res && res.code == 0){
                let list = self.data.list;
                res.data.map((item,index) => {
                    item.showVideo = false;     //默认不显示视频
                    item.videoDuration = util.changeTime(item.videoDuration);   //将视频播放时长修改为12:34格式
                    list.push(item)
                })
                if(res.data.length == 0){
                    //若无数据，则禁止显示下一页
                    self.setData({
                        next:false
                    })
                }
                self.setData({
                    list:list
                })
                self.setShareImgUrl();
            }else{
                wx.showModal({
                    title:'温馨提示',
                    content:res.message || '未知错误'
                })
            }
        })
    },
    goDetail(e){
        //跳转到详情页
        let id = e.currentTarget.dataset.id;
        let businessCategoryId = e.currentTarget.dataset.businesscategoryid;
        let _item = this.data.list.filter(item => item.id == id)[0];
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
    videoEnd(e){
        //视频播放完毕埋点
        let self = this;
        let id = e.currentTarget.dataset.id;
        let _filter = self.data.list.filter(item => item.id == id)[0];
        if(_filter.video){
            wx.reportAnalytics('video_end', {
                video_name: _filter.title,
            })
        }
    },
    play(e){
        //是否播放
        let self = this;
        let id = e.currentTarget.dataset.id;
        let list = this.data.list;
        list.map(item => item.showVideo = item.id == id?true:false);
        let _filter = list.filter(item => item.id == id)[0];
        if(_filter.video){
            this.setData({
                list:list
            })
            self.setData({
                id:_filter.id,
                businessCategoryId:_filter.businessCategoryId
            })
            //埋点(视频开始播放)
            wx.reportAnalytics('video_begin', {
                video_name: _filter.title,
            })
        }else{
            this.goDetail(e)
        }
    },
    bindplay(){
        //开始播放视频
        let self = this;
        return
        self.timeCount = setTimeout(() => {
            //记录一下，当返回首页的时候提示
            wx.setStorageSync('alertInfo',1);
            wx.setStorageSync('alertId',self.data.id);
            wx.setStorageSync('alertBusinessCategoryId',self.data.businessCategoryId);
        },30000)
    },
    goHeart(e,from){
        //点赞
        let self = this;
        let id = e.currentTarget.dataset.id;
        let _filter = self.data.list.filter(item => item.id == id)[0];

        if(self.data.sessionId){
            //优先反应
            let list = self.data.list;
            if(!from){
                list.map(item => {
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
                    list:list
                })
            }

            //提交后台
            util.getHeart(_filter.businessCategoryId,id,self.data.sessionId)
            .then(res => {
                if(res){
                    //点赞成功(获取真实点赞数据)
                    // console.log(res)
                    list.map(item => {
                        if(item.id == id){
                            item.isLike = res.data.isLike;
                            item.likeCount = res.data.likeCount;
                        }
                    })
                    self.setData({
                        list:list
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
        if(self.data.list.length > 0){
            let list = self.data.list;
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
                    list.map(item => {
                        if(item.id){
                            let _filter = res.data.filter(ele => ele.contentId == item.id)[0];
                            item.isLike = _filter.isLike;
                            item.likeCount = _filter.count;
                        }
                    })
                    self.setData({
                        list:list
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
        this.refreshLikeCount();
    },
    onUnload(){
        let self = this;
        if(self.timeCount){
            clearTimeout(self.timeCount);
        }
    },
    onLoad(e){
        //设置页面标题
        let self = this;
        self.setData({
            cateId:e.cateId?e.cateId:0
        })
        //分享进来携带的上一个用户的信息
        if(e && e.scene){
            let scene = decodeURIComponent(e.scene);
            self.setData({
                invite:scene
            })
        }
        wx.setNavigationBarTitle({
            title:e.title?e.title:'DDCTV'
        })
        wx.showToast({
            title:'',
            icon:'loading',
            duration:15000
        })
        //优先判断用户是否已登录
        util.isLogin().then(sessionId => {
            //若sessionId值为空，则没登录，否则已登录
            self.setData({
                sessionId:sessionId
            })
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
    }
})