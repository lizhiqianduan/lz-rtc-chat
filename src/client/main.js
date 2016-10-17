/**
 * Created by xiaohei on 2016/10/16.
 * More info,see my site http://www.lizhiqianduan.com.
 */

function simple_require(path_arr,cb){
    for(var i=0;i<path_arr.length;i++){
        var path = path_arr[i];
        if(simple_require.saved_path.indexOf(path) !=-1)
            continue;
        simple_require.saved_path.push(path);
        var script = document.createElement("script");
        script.src = path;
        script.onload = (function(_path){
            return function(evt){
                simple_require.loaded_path.push(_path);
            }
        })(path);
        document.body.appendChild(script);
    }
}
simple_require.saved_path = [];
simple_require.loaded_path = [];