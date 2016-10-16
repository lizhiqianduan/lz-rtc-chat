/**
 * Created by xiaohei on 2016/10/16.
 * More info,see my site http://www.lizhiqianduan.com.
 */

///////////////////////// common start ////////////////////////
var websocket = new WebSocket("ws:localhost:4080");
var my_stream
    , my_video_dom
    , my_image_dom
    , p2p_remote_video_dom = document.getElementById("p2p_remote_video")
    , capture_my_image_btn = document.getElementById("capture_my_image_btn")
    , iceServer = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]}
    , p2p_peer_connection
    , all_peers_map = {}
    , p2p_remote_client_id
    ;

///////////////////////// common end ////////////////////////




///////////////////////// socket start ////////////////////////
websocket.my_send = function(obj){
    this.send(JSON.stringify(obj));
};

websocket.onmessage = function (message) {
    var msg = JSON.parse(message.data);
    console.log(msg.message_id,message);
    switch (msg.message_id){
        case 1:
            console.log("connected to server!","your id is ",msg.body.your_id);
            break;
        case 2:
            on_id_list_coming(msg);
            break;
        case 3:
            console.log("offer coming!")
            on_offer_sdp_coming(msg);
            break;
        case 4:
            on_candidate_coming(msg);
            break;
        case 5:
            console.log("answer coming!")
            on_answer_sdp_coming(msg);
            break;
        case 6:
            console.log("client want to view",msg);
            on_new_client_want_to_view(msg);
            break;
        default :
            console.log(msg.id,msg,"no process!");
            break;
    }
};
websocket.onopen = function(){
};

function on_id_list_coming(msg){
    document.getElementById("client-list").innerHTML = "";
    msg.body.client_ids.forEach(function(ele){
        document.getElementById("client-list").innerHTML+=
            "<li><a href='javascript:void(0);' onclick='request_to_view_remote(\""+ ele +"\")'>"+ ele +"</a></li>";
    })
}
function on_offer_sdp_coming(msg){
//    document.getElementById("client-list").innerHTML = "";
//    msg.body.client_ids.forEach(function(ele){
//        document.getElementById("client-list").innerHTML+=
//            "<li><a href='javascript:void(0);' onclick='get_video_by_client_id(\""+ ele +"\")'>"+ ele +"</a></li>";
//    })
    p2p_peer_connection = new webkitRTCPeerConnection(iceServer);
    p2p_remote_client_id = msg.body.remote_id;
    var pc = p2p_peer_connection;
    pc.setRemoteDescription(msg.body.offer);
//    navigator.webkitGetUserMedia({ "audio": true, "video": true },gotStream, function(){});
//
//    function gotStream(stream){
//        pc.addStream(stream);
//    }


    pc.createAnswer(function(answer) {
        pc.setLocalDescription(answer);
        websocket.my_send({
            request_id:3,
            request_body:{
                answer:answer,
                remote_id:p2p_remote_client_id
            }
        });
    },function(){});

    pc.onaddstream = function (evt) {
        console.log("on add stream!");
        var remote_video = document.createElement('video');
        remote_video.src = window.URL.createObjectURL(evt.stream);
        remote_video.autoplay = true;
        p2p_remote_video_dom.appendChild(remote_video);
    };
    pc.onicecandidate = function(evt) {
        console.log(evt);
//        if (evt.candidate) {
        websocket.my_send({
            request_id:2,
            request_body:{remote_id:p2p_remote_client_id,candidate:evt.candidate}
        });
    };
}
function on_candidate_coming(msg){
    console.log("candidate",msg,p2p_peer_connection);
    if (msg.body.candidate) {
        p2p_peer_connection.addIceCandidate(
            new RTCIceCandidate(msg.body.candidate)
            ,function(){console.log("add cb!",arguments)}
            ,function(){console.log("err cb!",arguments)}
        );
    }
}

function on_answer_sdp_coming(msg){
    p2p_peer_connection.setRemoteDescription(
        new RTCSessionDescription(msg.body.answer)
    );
};

function on_new_client_want_to_view(msg){


    p2p_remote_client_id = msg.body.remote_id;
    p2p_peer_connection = new webkitRTCPeerConnection(iceServer);
    var pc = p2p_peer_connection;

//    register local stream to peer
    navigator.webkitGetUserMedia({ "audio": true, "video": true },gotStream, function(){});

    function gotStream(stream){
        pc.addStream(stream);
        pc.createOffer(function(offer) {
            pc.setLocalDescription(offer);
            websocket.my_send({
                request_id:1,
                request_body:{remote_id:p2p_remote_client_id,offer:offer}
            });
        },logError);
    }


    pc.onicecandidate = function(evt) {
        console.log(evt);
//        if (evt.candidate) {
        websocket.my_send({
            request_id:2,
            request_body:{remote_id:p2p_remote_client_id,candidate:evt.candidate}
        });
    };

    pc.oniceconnectionstatechange = function(evt){
        console.log(evt.target.iceConnectionState);
    };
    pc.onaddstream = function (evt) {
        console.log("on add stream!");
        var remote_video = document.createElement('video');
        remote_video.src = window.URL.createObjectURL(evt.stream);
        p2p_remote_video_dom.appendChild(remote_video);
    };



    function logError() { console.log(arguments) }
};

///////////////////////// socket end ////////////////////////


///////////////////////// dom click event start////////////////////////
function open_my_video(){
    navigator.webkitGetUserMedia({audio:true,video:true},onSuccess,function(){
        console.log("error!")
    });

    function onSuccess(stream) {
        my_stream = stream;

        my_video_dom = document.createElement("video");

        if (window.URL) {
            my_video_dom.src = window.URL.createObjectURL(stream);
        } else {
            my_video_dom.src = stream;
        }

        my_video_dom.autoplay = true;
        my_video_dom.width=320;
        document.getElementById('my-video').appendChild(my_video_dom);
        capture_my_image_btn.style.display = "inline";
    }
}

function close_my_video(){
    my_stream.getTracks().forEach(function(e){
        e.stop();
    });
    my_video_dom.remove();
    capture_my_image_btn.style.display = "none";
}

function capture_my_image(){
    if(my_image_dom) my_image_dom.remove();
    var canvas = document.createElement("canvas");
    canvas.width = my_video_dom.videoWidth;
    canvas.height = my_video_dom.videoHeight;
    canvas.getContext('2d')
        .drawImage(my_video_dom, 0, 0, canvas.width, canvas.height);
    canvas.style.width = "320px";
    my_image_dom = canvas;
    document.getElementById("my-image").appendChild(canvas);
}

//
function request_to_view_remote(client_id){

    websocket.my_send({
        request_id:4,
        request_body:{remote_id:client_id}
    });




//
////    console.log(client_id);
//    p2p_remote_client_id = client_id;
//    p2p_peer_connection = new webkitRTCPeerConnection(iceServer);
//    var pc = p2p_peer_connection;
//
////    navigator.getUserMedia({ "audio": true }, gotStream, logError);
//
////    register local stream to peer
//    pc.addStream(my_stream);
//
//    pc.onicecandidate = function(evt) {
//        console.log(evt);
////        if (evt.candidate) {
//        websocket.my_send({
//            request_id:2,
//            request_body:{remote_id:client_id,candidate:evt.candidate}
//        });
//    };
//
//    pc.oniceconnectionstatechange = function(evt){
//        console.log(evt.target.iceConnectionState);
//    };
//    pc.onaddstream = function (evt) {
//        console.log("on add stream!");
//        var remote_video = document.createElement('video');
//        remote_video.src = window.URL.createObjectURL(evt.stream);
//        p2p_remote_video_dom.appendChild(remote_video);
//    };
//    pc.createOffer(function(offer) {
//        pc.setLocalDescription(offer);
//        websocket.my_send({
//            request_id:1,
//            request_body:{remote_id:client_id,offer:offer}
//        });
//    },logError);
//
//
//    function logError() { console.log(arguments) }
//


}

///////////////////////// dom click event end////////////////////////




/////////////////// steps ///////////////
//➊ 初始化共享的发信通道 --> socket
//➋ 初始化RTCPeerConnection 对象
//➌ 向浏览器请求音频流
//➍ 通过RTCPeerConnection 注册本地音频流
//➎ 创建端到端连接的SDP（提议）描述
//➏ 以生成的SDP 作为端到端连接的本地描述
//➐ 通过发信通道向远端发送SDP 提议