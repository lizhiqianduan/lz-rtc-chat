/**
 * Created by xiaohei on 2016/10/16.
 * More info,see my site http://www.lizhiqianduan.com.
 */

/*
* manage all messages which will send to server.
* 管理当前客户端发送给服务端的所有消息.
* */
;(function(rtc){
    rtc.ClientMessage = ClientMessage;

    function ClientMessage(msg_id,msg_body){
        this.request_id = msg_id;
        this.request_body = msg_body;
        this.request_desc = ClientMessage.message_desc[msg_id]+"";
    }



    ClientMessage.message_desc = {
        "1":"send offer to remote",
        "1_zh":"向远端发送offer",

        "2":"send candidate to remote",
        "2_zh":"向远端发送candidate",

        "3":"send answer to remote",
        "3_zh":"向远端发送answer",

        "4":"request view remote video",
        "4_zh":"请求观看远端视频"
    };


})(lz.rtc);