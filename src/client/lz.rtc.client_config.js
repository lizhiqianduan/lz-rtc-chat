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

    window.webkitRTCPeerConnection = (window.webkitRTCPeerConnection || window.PeerConnection || window.webkitPeerConnection || window.msRTCPeerConnection || window.mozRTCPeerConnection);
    window.URL = (window.URL || window.webkitURL || window.msURL || window.oURL);
    navigator.webkitGetUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    window.RTCIceCandidate = (window.webkitRTCIceCandidate || window.RTCIceCandidate  ||window.mozRTCIceCandidate || window.msRTCIceCandidate);
    window.RTCSessionDescription = (window.mozRTCSessionDescription || window.RTCSessionDescription);

    lz.rtc.open_my_video = function(cb){
        navigator.webkitGetUserMedia({ "audio": false, "video": true },function(stream){
            rtc.my_stream = stream;
            cb(null,stream);
        }, cb);
    };
    lz.rtc.close_my_stream = function(){
        if(lz.rtc.my_stream)
            lz.rtc.my_stream.getTracks().forEach(function(t){t.stop()})
    };











})(window);