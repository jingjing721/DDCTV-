import util from '../../utils/util.js';
Page({
    data:{
        pageShow:1,         //页面是否显示 0不显示  1显示
        list:[
            {
                id:1,
                showVideo:false,             //是否播放视频
                title:'他靠道私房菜征服名流富豪他靠道私房菜征服名流富豪',
                time:'5月12日',
                duration:'04:23',
                desc:'Steven出生于洛杉矶，是Rossoblu餐厅的老板兼大厨，他的妈妈是意大利人，因为对小时候在妈妈家乡吃到的菜念念不忘 ，他在28岁时，放弃做医生转行去学厨。',
                imgUrl:'http://img0.daydaycook.com.cn/p/mo/mowjdyfqfz.jpg',
                heart:1,
                vSource:'http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400'
            },
            {
                id:2,
                showVideo:false,             //是否播放视频
                title:'2他靠40道私房菜征服名流富豪',
                time:'5月11日',
                duration:'04:23',
                desc:'Steven出生于洛杉矶，是Rossoblu餐厅的老板兼大厨，他的妈妈是意大利人，因为对小时候在妈妈家乡吃到的菜念念不忘 ，他在28岁时，放弃做医生转行去学厨。',
                imgUrl:'http://img0.daydaycook.com.cn/p/mo/mowjdyfqfz.jpg',
                heart:0,
                vSource:'http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400'
            },
            {
                id:3,
                showVideo:false,             //是否播放视频
                title:'3他靠40道私房菜征服名流富豪',
                time:'5月10日',
                duration:'04:23',
                desc:'Steven出生于洛杉矶，是Rossoblu餐厅的老板兼大厨，他的妈妈是意大利人，因为对小时候在妈妈家乡吃到的菜念念不忘 ，他在28岁时，放弃做医生转行去学厨。',
                imgUrl:'http://img0.daydaycook.com.cn/p/mo/mowjdyfqfz.jpg',
                heart:0,
                vSource:'http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400'
            },
            {
                id:4,
                showVideo:false,             //是否播放视频
                title:'4他靠40道私房菜征服名流富豪',
                time:'5月10日',
                duration:'04:23',
                desc:'Steven出生于洛杉矶，是Rossoblu餐厅的老板兼大厨，他的妈妈是意大利人，因为对小时候在妈妈家乡吃到的菜念念不忘 ，他在28岁时，放弃做医生转行去学厨。',
                imgUrl:'http://img0.daydaycook.com.cn/p/mo/mowjdyfqfz.jpg',
                heart:0,
                vSource:'http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400'
            },
        ]
    },
    onReachBottom(){
        //页面滚动到底部，加载下一页
        console.log('加载下一页')
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
    },
    onShareAppMessage(){
        //转发分享
        return {
            title:'DDCTV',
            path:'/pages/index/index'
        }
    }
})