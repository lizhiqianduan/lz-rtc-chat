/**
 * Created by xiaohei on 2016/10/16.
 * More info,see my site http://www.lizhiqianduan.com.
 */

// message desc send to client
var message_desc_send_to_client = {
    1:"connection conneted",
    2:"user id list"
};

// class
function Message(id,body){
    this.id = id;
    this.body = body;
    this.desc = get_desc_by_id(this.id);
}

Message.prototype.val = function(){
    return JSON.stringify(this);
};

exports = module.exports = Message;

// other private function
function get_desc_by_id(id){
    return message_desc_send_to_client[id];
}