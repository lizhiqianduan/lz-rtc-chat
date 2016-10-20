/**
 * Created by xiaohei on 2016/10/20.
 * More info,see my site http://www.lizhiqianduan.com.
 */

var
     dom_my_id  = $(".user-name")
    ,dom_room_list = $(".room-list>ul")
    , dom_room_li = $(".template-room")
    , dom_header_user = $("header .user")
    , dom_video = $("video")
    , dom_footer = $("footer")
    , my_client_id
    , alert = $.lz.Alert
    , peer_manager = lz.rtc.peerManager
    , channel = new lz.rtc.Channel({socket:{url:"ws:localhost:4080"}})
    ;

//////  channel event
channel.on_my_id_coming = function(message){
    my_client_id = message.body.your_id;
    dom_my_id.html(my_client_id);
};
channel.on_room_list_coming = function(msg){
    dom_room_list.html("");
    var room_map = msg.body.room_map;
    for(var id in room_map){
        var room = room_map[id];
        render_room(room);
    }
};



channel.on_new_client_want_to_view_my_video = function(msg){
    peer_manager.allow_remote_view(msg.body.remote_id);
};

////////// peer event
peer_manager.on_remote_stream_coming = function(remote_id,stream){
    console.log("on add stream!");
    var remote_video = document.createElement('video');
    remote_video.autoplay = true;
    remote_video.src = window.URL.createObjectURL(stream);
    document.getElementById("p2p_remote_video").appendChild(remote_video);
};


//////////// dom event
dom_footer.on("click",function(){
    $.lz.Alert("","创建直播间?",
        {
            type:"textInput",
            effect:"bigger",
            sure:on_sure
        });
    function on_sure(con){
        if(con.trim() =="")
            return $.lz.Alert("名字不能为空！");

        lz.rtc.open_my_video(function(err,stream){
            dom_video[0].autoplay = true;
            dom_video[0].src = window.URL.createObjectURL(stream);
            dom_video.show();
        });
//        channel.create_room(con);
    }
});
dom_room_li.live("click",function(){
    var self = $(this);
    $.lz.Alert({
        title:"提示"
        ,content:"进入该房间？"
        ,sure:on_sure
    });

    function on_sure(){

    }
});

////////// render function
function render_room(room){
    var dom = dom_room_li.clone();
    dom.data("room",room);
    if(room.room_owner_id == my_client_id)
        dom.addClass("my-room");
    dom.find(".room-name").text(room.room_name);
    dom.find(".room-owner").text(room.room_owner_id);
    dom_room_list.append(dom);
    dom.show();
}
