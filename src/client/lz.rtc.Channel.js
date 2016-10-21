/**
 * Created by xiaohei on 2016/10/17.
 * More info,see my site http://www.lizhiqianduan.com.
 */

/*
* module require `lz.rtc`
* */
;(function(rtc){
    rtc.Channel = Channel;
    var socket = null;
    var noop = function(){console.log("noop",arguments)};

    /*
    * options.channel_type                  : string
    * options.on_ready                      : function
    * options.on_my_id_coming               : function
    * options.on_id_list_coming             : function
    * options.on_offer_sdp_coming           : function
    * options.on_candidate_coming           : function
    * options.on_answer_sdp_coming          : function
    * options.on_new_client_want_to_view    : function
    * options.socket                        : {url:string}
    * */
    function Channel(options){
        this.is_ready = false;
        this.my_id = null;
        this.channel_type = options.channel_type || "socket";
        this.socket = null;
//        init this object
        var self = this;
        if(this.channel_type = "socket"){
            socket = new WebSocket(options.socket.url);
            rtc.socket_url = options.socket.url;
            this.socket = socket;
            socket.onopen = function(){
                self.is_ready = true;
                self.on_ready && self.on_ready("on ready");
            };
            socket.onmessage = function (message) {
                var msg = JSON.parse(message.data);
                var fn_name = Channel.dispatch_msg[msg.message_id];
                console.log(msg.message_id,fn_name);
                console.log(msg);
                if(self[fn_name] && typeof self[fn_name] == "function"){
                    self[fn_name](msg);
                }
            };
        }

//        init peer manager
        rtc.peerManager(this);
    }

    /*
    * send message
    * @param `msg`: ClientMessage
    * */
    Channel.prototype.send = function(msg){
        if(!this.is_ready){
            console.log("channel is not ready!");
            return;
        }
        if(this.channel_type == "socket"){
            socket.send(JSON.stringify(msg));
        }
    };

    /*
    * send offer to remote
    * remote_id : string
    * offer     : offer SDP
    * */
    Channel.prototype.send_offer_to_remote = function(remote_id,offer){
        this.send({
            request_id:1,
            request_body:{remote_id:remote_id,offer:offer}
        })
    };
    Channel.prototype.send_candidate_to_remote = function(remote_id,candidate){
        this.send({
            request_id:2,
            request_body:{remote_id:remote_id,candidate:candidate}
        })
    };

    Channel.prototype.send_answer_to_remote = function(remote_id,answer){
        this.send({
            request_id:3,
            request_body:{remote_id:remote_id,answer:answer}
        })
    };
    Channel.prototype.view_remote_video = function(remote_id){
        this.send({
            request_id:4,
            request_body:{remote_id:remote_id}
        })
    };
    Channel.prototype.create_room = function(room_name){
        this.send({
            request_id:5,
            request_body:{room_name:room_name}
        })
    };
    Channel.prototype.invite_client_to_join_my_room = function(remote_id){
        this.send({
            request_id:6,
            request_body:{remote_id:remote_id}
        })
    };
    Channel.prototype.apply_to_join_room = function(room_id){
        this.send({
            request_id:7,
            request_body:{room_id:room_id}
        })
    };
    Channel.prototype.get_client_info = function(client_id){
        this.send({
            request_id:8,
            request_body:{client_id:client_id}
        })
    };
    Channel.prototype.get_room_list = function(){
        this.send({
            request_id:9
        })
    };
    Channel.prototype.allow_to_join = function(client_id){
        this.send({
            request_id:10,
            request_body:{client_id:client_id}
        });
    };
    Channel.prototype.reject_to_join = function(client_id){
        this.send({
            request_id:11,
            request_body:{client_id:client_id}
        });
    };
    Channel.prototype.del_room = function(room_id){
        this.send({
            request_id:12,
            request_body:{room_id:room_id}
        });
    };
    Channel.prototype.leave_room = function(room_id){
        this.send({
            request_id:13,
            request_body:{room_id:room_id}
        })
    };
    Channel.prototype.send_im_to_room = function(im){
        this.send({
            request_id:14,
            request_body:{im:im}
        })
    };


    /*
    * Map for remote message id
    * */
    Channel.dispatch_msg = {
        1:"on_my_id_coming",
        2:"on_id_list_coming",
        3:"__on_offer_sdp_coming",
        4:"__on_candidate_coming",
        5:"__on_answer_sdp_coming",
        6:"on_new_client_want_to_view_my_video",
        7:"on_create_room_result_coming",
        8:"on_invite_client_result_coming",
        9:"on_new_room_invite_coming",
        10:"on_apply_to_join_room_result_coming",
        11:"on_new_client_join_room"
        ,12:"on_new_room_created"
        ,13:"on_client_closed"
        ,14:"on_new_client_connected"
        ,15:"on_room_list_coming"
        ,16:"on_client_info_coming"
        ,17:"on_new_join_apply_coming"
        ,18:"on_del_room_result_coming"
        ,19:"on_room_be_del_notify"
        ,20:"on_room_system_msg_coming"
        ,21:"on_new_im_msg_coming"
    };


})(lz.rtc);