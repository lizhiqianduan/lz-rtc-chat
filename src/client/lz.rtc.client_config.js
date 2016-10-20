/**
 * Created by xiaohei on 2016/10/16.
 * More info,see my site http://www.lizhiqianduan.com.
 */


;(function(window){
    if(window.lz){
        lz.rtc = {};
    }else{
        window.lz = {rtc:{}};
    }
    var rtc = lz.rtc;


    lz.rtc.open_my_video = function(cb){
        navigator.webkitGetUserMedia({ "audio": false, "video": true },function(stream){
            rtc.my_stream = stream;
            cb(null,stream);
        }, cb);
    };











})(window);