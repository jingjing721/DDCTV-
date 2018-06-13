let status = 0;    // 0 开发环境  1 测试环境  2 staging环境  3生产环境

let ajaxUrl  = status==0?'https://tv-d.daydaycook.com.cn':status==1?'https://tv-t.daydaycook.com.cn':status==2?'https://tv-s.daydaycook.com.cn':'https://tv.daydaycook.com.cn';              //用户、地址
let ajaxUrl2 = status==0?'https://uc-api-d.daydaycook.com.cn':status==1?'https://uc-api-t.daydaycook.com.cn':status==2?'https://uc-api-s.daydaycook.com.cn':'https://uc-api.daydaycook.com.cn';              //用户、地址
//通用Ajax请求接口
let fetch = (_url,params,type) => {
    return new Promise(resolve => {
        wx.request({
            url: _url,
            method: type || 'POST',
            data: params,
            complete(res){
                if(res.statusCode == 200){
                    resolve(res)
                }else if(res.errMsg.indexOf('time') > -1 || res.errMsg.indexOf('cancel') > -1){
                    wx.hideToast();
                    wx.showModal({
                        title:'温馨提示',
                        content:'请求超时，请返回重试'
                    })
                }else{
                    wx.hideToast();
                    wx.showModal({
                        title:'温馨提示',
                        content:'服务器错误'
                    })
                }
            }
        })
    })
}

//截取URL字符串
let getQueryString = (url,name) => {
    var search = '?'+url.split('?')[1];
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = search == "" ? null : decodeURIComponent(search).substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

let digitLength = (num) => {
  // Get digit length of e
  const eSplit = num.toString().split(/[eE]/);
  const len = (eSplit[0].split('.')[1] || '').length - (+(eSplit[1] || 0));
  return len > 0 ? len : 0;
}


//精确加法
let add = (num1,num2) => {
    const baseNum = Math.pow(10, Math.max(digitLength(num1), digitLength(num2)));
    return (accMul(num1, baseNum) + accMul(num2, baseNum)) / baseNum;
}

//精确减法
let reduce = (num1,num2) => {
    const baseNum = Math.pow(10, Math.max(digitLength(num1), digitLength(num2)));
    return (accMul(num1, baseNum) - accMul(num2, baseNum)) / baseNum;
}

//精确乘法
let accMul = (num1,num2) => {
    const num1Changed = Number(num1.toString().replace('.', ''));
    const num2Changed = Number(num2.toString().replace('.', ''));
    const baseNum = digitLength(num1) + digitLength(num2);
    return num1Changed * num2Changed / Math.pow(10, baseNum); 
}

//精确相除
let accDiv = (num1, num2) => {
    const num1Changed = Number(num1.toString().replace('.', ''));
    const num2Changed = Number(num2.toString().replace('.', ''));
    return accMul((num1Changed / num2Changed), Math.pow(10, digitLength(num2) - digitLength(num1)));
}

//判断手机号码是否合法
let isPhone = (number) => {
    if((/^1\d{10}$/).test(number)){
        return true;
    }else{
        return false;
    }
}

module.exports = {
    ajaxUrl:ajaxUrl,
    ajaxUrl2:ajaxUrl2,
    fetch:fetch,                            //封装Ajax
    getQueryString:getQueryString,          //截取URL参数
    add:add,                                //精确加法
    reduce:reduce,                          //精确减法
    accMul:accMul,                          //精确乘法
    accDiv:accDiv,                          //精确除法
    isPhone:isPhone,                        //判断手机号码是否合法
}