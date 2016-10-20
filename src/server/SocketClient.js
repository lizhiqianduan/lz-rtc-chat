/**
 * Created by xiaohei on 2016/10/16.
 * More info,see my site http://www.lizhiqianduan.com.
 */

var Message  = require("./Message.js");
var Room = require("./Room.js");
var User = require("./User.js");

// class
function SocketClient(ws) {
    this.socket_client_id = Date.now()+"."+parseInt((Math.random()*100000000).toString());
    this.ws = ws;
    this.client_room_id = null;
    this.bind_user = new User({bind_client_id:this.socket_client_id});
}

// save all socket clients in mem-map<id,client>
SocketClient.socket_clients = {};




SocketClient.prototype.bind_event = function(){
    var self = this;
    this.ws.on('message', function(message) {
        console.log('received: %s', message);
        var msg = JSON.parse(message);
        self.dispatch_client_message(msg);
    });
    this.ws.on('close',function(){
        console.log("close",self.socket_client_id);
        SocketClient.del(self);
        SocketClient.send_to_all(new Message(
            13,{client_id:self.socket_client_id}
        ).val());
    })
};

// dispatch message which from client
SocketClient.prototype.dispatch_client_message = function(message){
    var request_id = message.request_id;

    switch (request_id){
        case 1:
            this.offer_sdp_send_listener(request_id,message);
            break;
        case 2:
            this.candidate_send_listener(request_id,message);
            break;
        case 3:
            this.answer_sdp_send_listener(request_id,message);
            break;
        case 4:
            this.request_to_view_remote(request_id,message);
            break;
        case 5:
            this.on_create_room_listener(request_id,message);
            break;
        case 6:
            this.on_invite_client_listener(request_id,message);
            break;
        case 7:
            this.on_join_room_listener(request_id,message);
            break;
        case 8:
            this.on_get_client_info_listener(request_id,message);
            break;
        default :
            this.default_listener(request_id,message);
    }
};
SocketClient.prototype.send = function(str){
    this.ws.send(str);
};

/***************************************************************/
/////// section for peer2peer start /////////////////////////////
/////// 点对点通信部分 ////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
SocketClient.prototype.offer_sdp_send_listener = function(request_id,message){
    SocketClient.socket_clients[message.request_body.remote_id].ws.send(
        new Message(3,{
            offer:message.request_body.offer,
            remote_id:this.socket_client_id,
            your_id:message.request_body.remote_id
        }).val()
    );
};
SocketClient.prototype.candidate_send_listener = function(request_id,message){
    SocketClient.socket_clients[message.request_body.remote_id].ws.send(
        new Message(4,{
            candidate:message.request_body.candidate,
            remote_id:this.socket_client_id,
            your_id:message.request_body.remote_id
        }).val()
    );
};
SocketClient.prototype.answer_sdp_send_listener = function(request_id,message){
    console.log(message.request_body.remote_id,1111);
    SocketClient.socket_clients[message.request_body.remote_id].ws.send(
        new Message(5,{
            answer:message.request_body.answer,
            remote_id:this.socket_client_id,
            your_id:message.request_body.remote_id
        }).val()
    );
};
SocketClient.prototype.request_to_view_remote = function(request_id,message){
    SocketClient.socket_clients[message.request_body.remote_id].ws.send(
        new Message(6,{
            remote_id:this.socket_client_id,
            your_id:message.request_body.remote_id
        }).val()
    );
};
///// section for peer2peer end//////////////////////////////////
/////////////////////////////////////////////////////////////////


/***************************************************************/
/////// section for client start ////////////////////////////////
/////// 用户信息 部分 /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
SocketClient.prototype.on_get_client_info_listener = function(id,msg){
    this.send(new Message(16,{
        client_info:SocketClient.get_client_by_id(msg.request_body.client_id).bind_user
    }).val());
};
SocketClient.get_client_by_id =function(client_id){
    return SocketClient.socket_clients[client_id]||{};
};
///// section for client end/////////////////////////////////////
/////////////////////////////////////////////////////////////////






/***************************************************************/
/////// section for room start //////////////////////////////////
/////// 房间/群 操作部分 //////////////////////////////////
/////////////////////////////////////////////////////////////////
SocketClient.prototype.on_create_room_listener = function(request_id,message){
    var room = new Room({
        room_owner_id:this.socket_client_id,
        room_name:message.request_body.room_name
    });
    this.bind_user.add_created_room(room);
    SocketClient.socket_clients[this.socket_client_id].ws.send(
        new Message(7,{
            room:room,
            your_id:message.request_body.remote_id
        }).val()
    );
    SocketClient.send_to_all(new Message(12,{
        room:room
    }).val());
    SocketClient.send_to_all(new Message(15,{room_map:Room.get_all()}).val());

};
SocketClient.prototype.on_invite_client_listener = function(request_id,message){
    var be_invited_client_id = message.request_body.remote_id;
    var invite_client_id = this.socket_client_id;
    var be_invited_client = SocketClient.socket_clients[be_invited_client_id];
    var invite_result = 1;

    var room_id = message.request_body.room_id;

    if(!this.bind_user.created_rooms[room_id]){
        invite_result = 0;
    }
    this.ws.send(
        new Message(8,{
            remote_id:be_invited_client_id,
            result:invite_result
        }).val()
    );
    if(!invite_result) return;
    var room = Room.get_room_by_socket_client(this);
    room.add_invited_client(be_invited_client);
    be_invited_client.ws.send(
        new Message(9,{
            room:room,
            remote_id:invite_client_id,
            your_id:be_invited_client_id
        }).val()
    );
};
SocketClient.prototype.on_join_room_listener = function(request_id,message){
//    var room_id = message.request_body.room_id;
//    var room = Room.all_rooms[room_id];
//    var client_id = this.socket_client_id;
//    var join_result = 1;
//
//    if(!room.client_is_invited(this)){
//        join_result = 0;
//    }
//    this.ws.send(new Message(10,{
//        result:join_result,
//        room_id:room_id
//    }).val());
//
//    if(!join_result) return;
//    SocketClient.send_to_room(room,new Message(11,{
//        room:room,
//        client_id:client_id
//    }).val());
};
///// section for room end///////////////////////////////////////
/////////////////////////////////////////////////////////////////




SocketClient.prototype.default_listener = function (request_id,message) {
    this.ws.send(new Message(0,message).val());
};



//////////////// section for static method start  ///////////////
SocketClient.add = function(socket_client){
    SocketClient.socket_clients[socket_client.socket_client_id] = socket_client;
};
SocketClient.del = function(socket_client){
    delete SocketClient.socket_clients[socket_client.socket_client_id];
};
SocketClient.get_all_clients_id = function(){
    return Object.keys(SocketClient.socket_clients);
};
SocketClient.send_to_room = function(room,message){
    Object.keys(room.room_clients_id).forEach(function(id){
        SocketClient.socket_clients[id].send(message);
    })
};
SocketClient.send_to_all = function(message){
    Object.keys(SocketClient.socket_clients).forEach(function(id){
        SocketClient.socket_clients[id].send(message);
    })
};
//////////////// section for static method end  /////////////////


exports = module.exports = SocketClient;