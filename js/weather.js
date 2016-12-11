
//获取天气数据
 $.ajax({
    type : 'get',
    url : 'http://wthrcdn.etouch.cn/weather_mini?city=成都',
    dataType : 'jsonp',
    jsonpCallback:"showWeather",
    success : function(data){
       console.log(data);
       showWeather(data.data)
     },
    error:function(){
         alert('请求失败');
    }
 });

function showWeather(data){
	$('.miniWeather strong').html(data.wendu+' ℃')
}