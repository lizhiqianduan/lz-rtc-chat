/**
 * Created by xiaohei on 2016/10/16.
 * More info,see my site http://www.lizhiqianduan.com.
 */

///////////////////////// common start ////////////////////////
var websocket = new WebSocket("ws:localhost:4080");
var my_stream
    , my_video_dom
    , my_image_dom
    , capture_my_image_btn = document.getElementById("capture_my_image_btn");

///////////////////////// common end ////////////////////////




///////////////////////// socket start ////////////////////////
websocket.onmessage = function (message) {
    var msg = JSON.parse(message.data);
    switch (msg.id){
        case 1:
            console.log("connected to server!");
            break;
        case 2:
            on_id_list_comming(msg);
            break;
        default :
            console.log(msg.id,msg,"no process!");
            break;
    }
};
websocket.onopen = function(){
};

function on_id_list_comming(msg){
    document.getElementById("client-list").innerHTML = "";
    msg.body.client_ids.forEach(function(ele){
        document.getElementById("client-list").innerHTML+=
            "<li><a href='javascript:void(0);' onclick='lookup(\""+ ele +"\")'>"+ ele +"</a></li>";
    })
}


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

function get_users_from_server(){

}
///////////////////////// dom click event end////////////////////////

