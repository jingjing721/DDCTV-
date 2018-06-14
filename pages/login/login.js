import util from '../../utils/util.js';
Page({ 
    data: {
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
                            console.log(res3.data.session)
                        }else{
                            wx.hideToast();
                            let msg;
                            switch(res3.code){
                                case(0):msg = '授权失败，请重试';break;
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
    }
})