/**
 * Created by xiaohei on 2016/10/16.
 * More info,see my site http://www.lizhiqianduan.com.
 */

var Message  = require("./Message.js");
var Room = require("./Room.js");

// class
function SocketClient(ws) {
    this.socket_client_id = Date.now()+"."+parseInt((Math.random()*100000000).toString());
    this.ws = ws;
}

// save all socket clients in mem-map<id,client>
SocketClient.socket_clients = {};




SocketClient.prototype.bind_event = function(){
    var self = this;
    this.ws.on('message', function(message) {
        console.log('received: %s', message);
        var msg = JSON.parse(message);
        self.dispatch_message(msg);
    });
    this.ws.on('close',function(){
        console.log("close",self.socket_client_id);
        SocketClient.del(self);
    })
};

SocketClient.prototype.dispatch_message = function(message){
    var request_id = message.request_id;
    var request_body = message.request_body;

    switch (request_id){
        default :
            this.default_listenner(request_id,message);
    }
};

SocketClient.prototype.default_listenner = function (request_id,message) {
    this.ws.send(new Message(0,message).val());
};

SocketClient.prototype.join_room = function(room_name){

};


//////////////// section for static method start
SocketClient.add = function(socket_client){
    SocketClient.socket_clients[socket_client.socket_client_id] = socket_client;
};
SocketClient.del = function(socket_client){
    delete SocketClient.socket_clients[socket_client.socket_client_id];
};
SocketClient.get_all_clients_id = function(){
    return Object.keys(SocketClient.socket_clients);
};
//////////////// section for static method end


exports = module.exports = SocketClient;