/**
 * Created by xiaohei on 2016/10/17.
 * More info,see my site http://www.lizhiqianduan.com.
 */


;(function (rtc) {
    rtc.peerManager = peerManager;
    rtc.my_stream = null;
    var iceServer = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]}
        , _channel
        , noop = function(){}
        ;

    var all_peer_connections = rtc.all_peer_connections = {};

    function peerManager(channel,options) {
        var self = this;
        this.on_remote_stream_coming = options.on_remote_stream_coming || noop;
        _channel = channel;
        channel.on_offer_sdp_coming = function(msg){
            var p2p_peer_connection = new webkitRTCPeerConnection(iceServer);
            var p2p_remote_client_id = msg.body.remote_id;
            all_peer_connections[p2p_remote_client_id] = p2p_peer_connection;
            var pc = p2p_peer_connection;
            pc.onaddstream = (function (p2p_remote_client_id) {
                return function(evt){
                    self.on_remote_stream_coming(p2p_remote_client_id,evt.stream);
                }
            })(p2p_remote_client_id);
            pc.onicecandidate = (function(p2p_remote_client_id) {
                return function(evt){
                    if(evt.candidate)
                        channel.send_candidate_to_remote(p2p_remote_client_id,evt.candidate);
                }
            })(p2p_remote_client_id);

            pc.setRemoteDescription(msg.body.offer);
            pc.createAnswer(function(answer) {
                pc.setLocalDescription(answer);
                channel.send_answer_to_remote(msg.body.remote_id,answer);
            },function(){});
        };
        channel.on_answer_sdp_coming = function(msg){
            var p2p_peer_connection = all_peer_connections[msg.body.remote_id];
            p2p_peer_connection.setRemoteDescription(
                new RTCSessionDescription(msg.body.answer)
            );
        };

        channel.on_candidate_coming = function(msg){
            var p2p_peer_connection = all_peer_connections[msg.body.remote_id];
            if(msg.body.candidate)
                p2p_peer_connection.addIceCandidate(
                    new RTCIceCandidate(msg.body.candidate)
                );
        };
    }


    peerManager.allow_remote_view = function(remote_id){
        var channel =_channel;
        console.log("on_new_client_want_to_view_my_video");
        var p2p_remote_client_id = remote_id;
        var p2p_peer_connection = new webkitRTCPeerConnection(iceServer);
        all_peer_connections[p2p_remote_client_id] = p2p_peer_connection;
        var pc = p2p_peer_connection;
        pc.onicecandidate = (function(p2p_remote_client_id) {
            return function(evt){
                if(evt.candidate)
                    channel.send_candidate_to_remote(p2p_remote_client_id,evt.candidate);
            }
        })(p2p_remote_client_id);
        pc.oniceconnectionstatechange = function(evt){
//                console.log(2222,evt.target.iceConnectionState);
        };
        pc.onaddstream = (function (p2p_remote_client_id) {
            return function(evt){
                self.on_remote_stream_coming(p2p_remote_client_id,evt.stream);
            }
        })(p2p_remote_client_id);

        if(rtc.my_stream){
            pc.addStream(rtc.my_stream);
            pc.createOffer(function(offer) {
                pc.setLocalDescription(offer);
                channel.send_offer_to_remote(p2p_remote_client_id,offer);
            },noop);
            return;
        }

        navigator.webkitGetUserMedia({ "audio": true, "video": true },function(stream){
            rtc.my_stream = stream;
            pc.addStream(stream);
            pc.createOffer(function(offer) {
                pc.setLocalDescription(offer);
                channel.send_offer_to_remote(p2p_remote_client_id,offer);
            },noop);
        }, noop);
    };



})(lz.rtc);