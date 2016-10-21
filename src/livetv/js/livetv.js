/**
 * Created by xiaohei on 2016/10/20.
 * More info,see my site http://www.lizhiqianduan.com.
 */

var
     dom_my_id  = $(".user-name")
    ,dom_room_list = $(".room-list>ul")
    , dom_room_li = $(".template-room")
    , dom_header_user = $("header .user")
    , dom_video_section = $(".video")
    , dom_video = $("video")
    , dom_footer = $("footer")
    , my_client_id
    , my_current_room
    , room_list_map
    , peer_manager = lz.rtc.peerManager
    , channel = new lz.rtc.Channel({socket:{url:"ws:192.168.10.168:4080"}})
    ;

//////  channel event
channel.on_my_id_coming = function(message){
    my_client_id = message.body.your_id;
    dom_my_id.html(my_client_id);
};
channel.on_room_list_coming = function(msg){
    dom_room_list.html("");
    var room_map = msg.body.room_map;
    room_list_map = room_map;
    for(var id in room_map){
        var room = room_map[id];
        render_room(room);
    }
};
channel.on_create_room_result_coming = function(msg){
    var result = msg.body.result;
    if(result== 0){
        lz.rtc.open_my_video(function(err,stream){
            dom_video[0].autoplay = true;
            dom_video[0].src = window.URL.createObjectURL(stream);
            dom_video_section.show();
            dom_footer.hide();
        });
        return;
    }

    var content = "";
    if(result == 1){
        content = "你已经创建了房间，不能再次创建！";
    }else if(result == 2){
        content = "你正在别人的房间，请先退出再创建！";
    }
    $.lz.Alert(content);
};

channel.on_apply_to_join_room_result_coming = function(msg){
    var result = msg.body.result;
    if(result==0) {
        my_current_room = msg.body.room;
        return;
    }
    var error = [];
    error[1] = error[2] = "请事先退出当前房间！";
    error[3] = "该房间不存在或已被删除！";
    error[4] = "已达该房间人数限制!";
    if(result == 5)
    error[5] = msg.body.room.room_name+" 房主拒绝了你的请求！";
    $.lz.Alert({
        title:"提示",
        content:error[result],
        effect:"bigger"
    });
};

channel.on_new_join_apply_coming = function(msg){
    var client_id = msg.body.client_id;
    $.lz.Alert({
        type:"confirm",
        title:"提示",
        content:"用户"+client_id+"申请加入房间",
        sure:function(){
            channel.allow_to_join(client_id);
            peer_manager.allow_remote_view(client_id);
        },
        closeCallback:reject,
        cancelCallback:reject
    });
    function reject(){
        channel.reject_to_join(client_id);
    }
};

channel.on_client_closed = function(msg){
    var client_info = msg.body.client_info;
    var client_created_room  = client_info.client_created_room;
    var client_be_in_room  = client_info.client_be_in_room;
    if(client_created_room){
        dom_room_list.html("");
        delete room_list_map[client_created_room.room_id];
        for(var id in room_list_map){
            var room = room_list_map[id];
            render_room(room);
        }
        if(my_current_room && my_current_room.room_id == client_created_room.room_id){
            $.lz.Alert({title:"提示",content:"直播间 "+client_created_room.room_name+" 已被房主解散！",effect:"bigger"});
            dom_video[0].pause();
            dom_video_section.hide();
        }
    }
};


channel.on_new_client_want_to_view_my_video = function(msg){
    peer_manager.allow_remote_view(msg.body.remote_id);
};

////////// peer event
peer_manager.on_remote_stream_coming = function(remote_id,stream){
    console.log("on add stream!");

    dom_video[0].autoplay = true;
    dom_video[0].src = window.URL.createObjectURL(stream);
    dom_video_section.show();

//    var remote_video = document.createElement('video');
//    remote_video.autoplay = true;
//    remote_video.src = window.URL.createObjectURL(stream);
//    document.getElementById("p2p_remote_video").appendChild(remote_video);
};


//////////// dom event
dom_footer.on("click",function(){
    $.lz.Alert({
            title:"创建直播间？",
            type:"textInput",
            effect:"bigger",
            sure:on_sure
        });
    function on_sure(room_name){
        if(room_name.trim() =="")
            return $.lz.Alert("名字不能为空！");

        channel.create_room(room_name);
    }
});
dom_room_li.live("click",function(){
    var self = $(this);
    var room = self.data("room");
    channel.apply_to_join_room(room.room_id);
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
