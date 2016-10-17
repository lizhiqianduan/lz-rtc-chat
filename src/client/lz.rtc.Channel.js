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
        this.on_ready = options.on_ready || noop;
        this.on_id_list_coming = options.on_id_list_coming || noop;
        this.on_my_id_coming = options.on_my_id_coming || noop;
        this.__on_offer_sdp_coming = options.__on_offer_sdp_coming || noop;
        this.__on_candidate_coming = options.__on_candidate_coming || noop;
        this.__on_answer_sdp_coming = options.__on_answer_sdp_coming || noop;
        this.on_new_client_want_to_view_my_video = options.on_new_client_want_to_view_my_video || noop;

//        init this object
        var self = this;
        if(this.channel_type = "socket"){
            socket = new WebSocket(options.socket.url);
            socket.onopen = function(){
                self.is_ready = true;
                self.on_ready("on ready");
            };
            socket.onmessage = function (message) {
                var msg = JSON.parse(message.data);
//                console.log(msg.message_id,msg);
                var fn_name = Channel.dispatch_msg[msg.message_id];
                if(self[fn_name] && typeof self[fn_name]){
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




    /*
    * Map for remote message id
    * */
    Channel.dispatch_msg = {
        1:"on_my_id_coming",
        2:"on_id_list_coming",
        3:"__on_offer_sdp_coming",
        4:"__on_candidate_coming",
        5:"__on_answer_sdp_coming",
        6:"on_new_client_want_to_view_my_video"
    };


})(lz.rtc);