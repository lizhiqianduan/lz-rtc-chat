/**
 * Created by xiaohei on 2016/10/19.
 * More info,see my site http://www.lizhiqianduan.com.
 */


function User(options){
    this.bind_client_id = options.bind_client_id;
    this.user_name = null;
    this.created_rooms = {};
    this.joined_rooms = {};
}

User.prototype.add_created_room = function(room){
    this.created_rooms[room.room_id] = room;
};
User.prototype.del_created_room = function(room_id){
    delete this.created_rooms[room_id];
};
User.prototype.add_joined_room = function(room){
    this.joined_rooms[room.room_id] = room;
};
User.prototype.del_joined_room = function(room_id){
    delete this.joined_rooms[room_id];
};
User.prototype.set_user_name = function(name){
    this.user_name = name;
};
User.prototype.get_created_room_size = function(){
    return Object.keys(this.created_rooms).length;
};
exports = module.exports = User;