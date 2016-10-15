/**
 * Created by xiaohei on 2016/10/16.
 * More info,see my site http://www.lizhiqianduan.com.
 */

var url = require("url");
var Message = require("./Message.js");
var SocketClient = require("./SocketClient.js");




function init(options) {
    var wss = options.wss;
    wss.on('connection', function(ws) {
        console.log("new connection");
        var socket_client = new SocketClient(ws);
        socket_client.bind_event();
        SocketClient.add(socket_client);

        ws.send(
            new Message(1,{
                msg:"connected!",
                yourId:socket_client.socket_client_id
            }).val()
        );

    });
}


module.exports = init;















