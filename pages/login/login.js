import util from '../../utils/util.js';
Page({ 
    data: {
    },
    onGotUserInfo(res){
        //获取code值
        wx.showToast({
            title:'加载中...',
            icon:'loading',
            duration:15000
        })
        let self = this;
        wx.login({
            success(res2){
                if(res.detail.errMsg.indexOf('ok') > -1){
                    util.fetch(util.ajaxUrl2+'/mini/auth',{
                        encryptedData:res.detail.encryptedData,
                        iv:res.detail.iv,
                        code:res2.code
                    },'GET').then(xhr => {
                        //获取sessionId后获取附近门店列表
                        wx.hideToast();
                        let res3 = xhr.data;
                        console.log(res3)

                        return
                        if(res3 && res3.responseCode == 0){
                            wx.setStorageSync('sessionId',res3.sessionId)
                            wx.setStorageSync('statusMap',res3.statusMap)
                            wx.navigateBack({
                                delta:1
                            })
                        }else{
                            wx.showModal({
                                title:'温馨提示',
                                content:res3.responseMsg || '未知错误'
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
    }
})