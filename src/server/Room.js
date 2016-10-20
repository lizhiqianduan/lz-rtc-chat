/**
 * Created by xiaohei on 2016/10/16.
 * More info,see my site http://www.lizhiqianduan.com.
 */

/*
*
* class `Room`
* @@ one client only have one room
* options.room_owner_id
* options.room_name
* options.room_max_size
* */
function Room(options){
    this.room_owner_id = options.room_owner_id;
    this.room_name = options.room_name;
    this.room_id = Date.now()+"."+parseInt((Math.random()*100000000).toString());
    this.room_max_size = options.room_max_size || 100;
    this.room_size = 1;
    this.room_clients_id = {};
    this.room_invited_clients_id = {};

//    init
    this.room_clients_id[this.room_owner_id] = this.room_owner_id;

    Room.all_rooms[this.room_id] = this;
}
Room.all_rooms = {};
//Room.defaultRoom = new Room({room_name:"default room"});

Room.prototype.add_client = function(socket_client){
    var client_id = socket_client.socket_client_id;
    this.room_clients_id[client_id] = client_id;
    this.room_size++;
};
Room.prototype.del_client = function(socket_client){
    var res = delete this.room_clients_id[socket_client.socket_client_id];
    if(res)
        this.room_size--;
};
Room.prototype.add_invited_client = function(socket_client){
    var client_id = socket_client.socket_client_id;
    this.room_invited_clients_id[client_id] = client_id;
};
Room.prototype.del_invited_client = function(socket_client){
    delete this.room_invited_clients_id[socket_client.socket_client_id];
};
Room.prototype.client_is_invited = function(socket_client){
    return this.room_invited_clients_id[socket_client.socket_client_id];
};
Room.prototype.get_size = function(){
    return this.room_size;
};
Room.prototype.get_attendee_ids = function(){
    var out = [];
    var self = this;
    Object.keys(this.room_clients_id).forEach(function(ele){
        if(ele != self.room_owner_id)
            out.push(ele);
    });
    return out;
};


////////////////// static method ////////////
Room.get_room_by_socket_client = function(client){
    return Room.all_rooms[client.client_room_id];
};
Room.get_all = function(){
    return Room.all_rooms;
};

exports = module.exports = Room;