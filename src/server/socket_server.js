/**
 * Created by xiaohei on 2016/10/16.
 * More info,see my site http://www.lizhiqianduan.com.
 */

var url = require("url");
var Message = require("./Message.js");
var SocketClient = require("./SocketClient.js");
var Room = require("./Room.js");



function init(options) {
    var wss = options.wss;
    wss.on('connection', function(ws) {
        var socket_client = new SocketClient(ws);
        console.log("new connection",socket_client.socket_client_id);
        socket_client.bind_event();
        SocketClient.send_to_all(new Message(14,{
            client_id:socket_client.socket_client_id
        }).val());
        SocketClient.add(socket_client);

        ws.send(
            new Message(1,{
                msg:"connected!",
                your_id:socket_client.socket_client_id
            }).val()
        );

        SocketClient.send_to_all(new Message(2,{
                client_ids:SocketClient.get_all_clients_id(),
                your_id:socket_client.socket_client_id
            }).val());
//        SocketClient.get_all_clients_id().forEach(function(id){
//            SocketClient.socket_clients[id].ws.send(
//            );
//        });
    });
    wss.on("error",function(){
        console.log("wss error!")
    });
}


module.exports = init;















