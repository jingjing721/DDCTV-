import util from '../../utils/util.js';
Page({
    data:{
        pageShow:1,         //页面是否显示 0不显示  1显示
        list:[],
        end:false,          //是否加载完毕
    },
    onReachBottom(){
        //页面滚动到底部，加载下一页
        console.log('加载下一页')
    },
    init(){
        //页面初始化，请求每日十件
        let self = this;
        util.fetch(util.ajaxUrl+'top-content/list',{
            date:+new Date()
        }).then(res => {
            if(res && res.code == 0){
                res.data.map((item,index) => {
                    item.showVideo = false;     //默认不显示视频
                    item.videoDuration = util.changeTime(item.videoDuration);   //将视频播放时长修改为12:34格式
                })
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
    play(e){
        //是否播放
        let id = e.currentTarget.dataset.id;
        let list = this.data.list;
        list.map(item => item.showVideo = item.id == id?true:false)
        this.setData({
            list:list
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
    goClassify(){
        //跳转到分类页面
        wx.navigateTo({
            url:'../classify/classify'
        })
    },
    onShow(){},
    onLoad(e){
        //设置页面标题
        wx.setNavigationBarTitle({
            title:'DDCTV'
        })
        this.init();
        // wx.navigateTo({
            // url:'../login/login'
        // })
    },
    onShareAppMessage(){
        //转发分享
        return {
            title:'DDCTV',
            path:'/pages/index/index'
        }
    }
})