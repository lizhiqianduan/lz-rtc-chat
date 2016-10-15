/**
 * Created by xiaohei on 2016/10/16.
 * More info,see my site http://www.lizhiqianduan.com.
 */


function Room(options){

    this.room_id = Date.now()+""+parseInt((Math.random()*100000000).toString());
    this.room_name = options.room_name;

    this.room_socket_clients = {};

    Room.all_rooms[this.room_id] = this;
}
Room.all_rooms = {};
Room.defaultRoom = new Room({room_name:"default room"});

Room.prototype.add_client = function(socket_client){
    this.room_socket_clients[socket_client.socket_client_id] = socket_client;
};
Room.prototype.del_client = function(socket_client){
    delete this.room_socket_clients[socket_client.socket_client_id];
};




exports = module.exports = Room;