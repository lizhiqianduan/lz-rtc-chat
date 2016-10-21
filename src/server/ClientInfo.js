/**
 * Created by xiaohei on 2016/10/19.
 * More info,see my site http://www.lizhiqianduan.com.
 */


function ClientInfo(options){
    this.client_id = options.client_id;
    this.client_name = null;
    this.client_created_room = null;
    this.client_be_in_room = null;
}

ClientInfo.prototype.add_created_room = function(room){
    this.client_created_room = room;
};
ClientInfo.prototype.del_created_room = function(room_id){
    this.client_created_room = null;
};
ClientInfo.prototype.add_joined_room = function(room){
    this.client_be_in_room = room;
};
ClientInfo.prototype.del_joined_room = function(room_id){
    this.client_be_in_room = null;
};
ClientInfo.prototype.set_user_name = function(name){
    this.client_name = name;
};

exports = module.exports = ClientInfo;