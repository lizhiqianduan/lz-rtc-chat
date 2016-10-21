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
    , dom_im_list = $(".im-list")
    , dom_template_im = $(".im")
    , dom_template_im_notify = $(".room-notify")
    , dom_close_video = $(".close-video")
    , dom_refresh_btn = $(".refresh")
    , dom_im_input = $(".im-input")
    , dom_footer = $("footer")
    , my_client_id
    , im_max_item = 30
    , my_current_room
    , my_create_room
    , room_list_map
    , default_size = 1200
    , peer_manager = lz.rtc.peerManager
    , channel = new lz.rtc.Channel({socket:{url:"ws:192.168.10.168:4080"}})
    ;
init_channel(channel);

function init_channel(channel){
//////  channel event
channel.on_my_id_coming = function(message){
    my_client_id = message.body.your_id;
    dom_my_id.html(my_client_id);
    channel.get_room_list();
};
channel.on_room_list_coming = function(msg){
    dom_room_list.html("");
    var room_map = msg.body.room_map;
    render_room_map(room_map);
};
channel.on_create_room_result_coming = function(msg){
    var result = msg.body.result;
    if(result== 0){
        my_current_room = my_create_room = msg.body.room;
        dom_video.data("room",msg.body.room);
        lz.rtc.open_my_video(function(err,stream){
            disable_scroll_bar(true);
            dom_room_list.hide();
            dom_video[0].autoplay = true;
            dom_video[0].src = window.URL.createObjectURL(stream);
            dom_video[0].onload = dom_video[0].onplay = function(){
//                $.lz.autoMiddle(window,$("video"));
                $.lz.autoMiddle($(".video"),$("video"))
            };
            dom_video_section.find(".room-name").text(my_current_room.room_name);
            dom_video_section.height($(window).height());
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
        dom_im_list.html("");
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
    if(!my_create_room.need_owner_allow){
        channel.allow_to_join(client_id);
        peer_manager.allow_remote_view(client_id);
        return;
    }
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
channel.on_new_client_join_room = function(msg){
//    var room = msg.body.room;
//    var client_info = msg.body.client_info;
//    var notify_type = msg.body.notify_type;
//    var con = "";
//    con+= client_info.client_name?client_info.client_name:client_info.client_id;
//    if(notify_type == 1){
//        con+="离开房间"
//    }else if(notify_type == 2){
//        con+="加入房间"
//    }
//    render_room_system_notify(con);
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
            dom_room_list.show();
            dom_footer.show();
            disable_scroll_bar(false);
            channel.get_room_list();
        }
    }
};


channel.on_new_client_want_to_view_my_video = function(msg){
    peer_manager.allow_remote_view(msg.body.remote_id);
};

channel.on_del_room_result_coming = function(msg){
    var result = msg.body.result;
    var error = [];
    error[2] = "该房间不是你所创建的！";
    error[1] = "你还没创建过房间呢！";
    if(result !=0)
        $.lz.Alert(error[result]);
};
channel.on_room_be_del_notify = function(msg){
    var room = msg.body.room;
    if(my_current_room && my_current_room.room_id == room.room_id){
        $.lz.Alert({content:"直播间 "+my_current_room.room_name+" 已被房主解散！",effect:"bigger"});
        dom_video[0].pause();
        dom_video_section.hide();
        dom_room_list.show();
        dom_footer.show();
        disable_scroll_bar(false);
    }
    delete room_list_map[room.room_id];
    render_room_map(room_list_map);
};
channel.on_room_system_msg_coming = function(msg){
    var room = msg.body.room;
    var client_info = msg.body.client_info;
    var notify_type = msg.body.notify_type;
    var cursize = parseInt(dom_video_section.find(".size").text());
    var con = "";
    con+= client_info.client_name?client_info.client_name:client_info.client_id;
    if(notify_type == 1){
        var pc = lz.rtc.all_peer_connections[client_info.client_id];
        if(pc) pc.close();
        con+="离开房间";
        dom_video_section.find(".size").text(--cursize);
    }else if(notify_type == 2){
        con+="加入房间";
        dom_video_section.find(".size").text(++cursize);
    }
    render_room_system_notify(con);
    dom_im_list.scrollTop(999999999);
};
channel.on_new_im_msg_coming =function(msg){
    var im_length = dom_im_list.find("li").length;
    if(im_length>im_max_item){
        for(var i=0;i<im_length;i++){
            var ele = dom_im_list.find("li").eq(i);
            ele.remove();
            if(dom_im_list.find("li").length == im_max_item) break;
        }
    }
    var room = msg.body.room;
    var client_info = msg.body.client_info;
    var im = msg.body.im;
    if(!my_current_room || room.room_id != my_current_room.room_id) return;
    render_im(client_info,im);
    dom_im_list.scrollTop(999999999);
};

channel.on_server_error_coming = function(msg){
    $.lz.Alert(""+msg.body.message);
};
};


////////// peer event
peer_manager.on_remote_stream_coming = function(remote_id,stream){
    console.log("on add stream!");
    disable_scroll_bar(true);
    dom_room_list.hide();
    dom_video_section.find(".room-name").text(my_current_room.room_name);

    dom_video[0].autoplay = true;
    dom_video[0].src = window.URL.createObjectURL(stream);
    dom_video[0].onload = dom_video[0].onplay = function(){
        $.lz.autoMiddle($(".video"),$("video"))
    };

    dom_video_section.show();
    dom_video_section.height($(window).height());
    dom_video_section.show();
    dom_footer.hide();

};
peer_manager.onerror = function(msg){
    alert("设备不一致，无法观看该主播!");
    if(my_current_room)
        channel.leave_room(my_current_room.room_id);
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
dom_close_video.on("click",function(){
//    var room = dom_video.data("room");
    if(my_create_room){
        $.lz.Alert({
            title:"提示",
            type:"confirm",
            content:"你是该房间房主，确定退出吗？"
            ,sure:function(){
                channel.del_room(my_create_room.room_id);
                disable_scroll_bar(false);
                dom_video_section.hide();
                lz.rtc.close_my_stream();
                dom_room_list.show();
                channel.get_room_list();
            }
        });
    }else if(my_current_room){
        channel.leave_room(my_current_room.room_id);
        my_create_room = my_current_room = null;
        disable_scroll_bar(false);
        dom_video_section.hide();
        dom_room_list.show();
        channel.get_room_list();
    }

});
dom_im_input.find("form").on("submit",function(){
    var con = dom_im_input.find("input").val();
    if(con.trim()==""){
        $.lz.Alert("不能发空消息！");
        dom_im_input.find("input").blur();
        return false;
    }
    channel.send_im_to_room(con);
    dom_im_input.find("input").val("");
    return false;
});
dom_refresh_btn.on("click",function(){
    channel.get_room_list();
});

window.onbeforeunload = function(){
    return "刷新页面将会关闭你的直播间，确认重新加载吗？";
};

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
function render_room_map(room_map){
    dom_room_list.html("");
    if(Object.keys(room_map).length == 0){
        return dom_room_list.html("直播间列表为空，要不自己创建一个吧！");
    }
    room_list_map = room_map;
    for(var id in room_map){
        var room = room_map[id];
        render_room(room);
    }
}
function render_im(client_info,im){
    var dom = dom_template_im.clone();
    var name = client_info.client_name || client_info.client_id;
    dom.find(".user").text(name+":");
    dom.find(".msg").text(im);
    dom.show();
    dom_im_list.append(dom);
}
function render_room_system_notify(con){
    var dom = dom_template_im_notify.clone();
    dom.text(con);
    dom.show();
    dom_im_list.append(dom);
}


//////////// tool function
function disable_scroll_bar(bool){
    if(bool)
        $("body").height($(window).height()).css({overflow:"hidden"});
    else
        $("body").css({overflow:"auto",height:"auto"});
};


