/**
 * Created by xiaohei on 2016/10/16.
 * More info,see my site http://www.lizhiqianduan.com.
 */

var server = require('http').createServer()
    , url = require('url')
    , WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({ server: server })
    , express = require('express')
    , app = express()
    , port = process.env.PORT || 4080;


app.use(express.static("./src"));
server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + server.address().port) });

require("./socket_server.js")({wss:wss});