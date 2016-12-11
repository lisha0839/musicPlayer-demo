
	
	//初始化时间，记录旧时间
	var oldTime = getTime();
	getDates();
	timeInit();

	//时钟初始化
	function timeInit(){
		//时间助手数据初始化
		$('.dateTime li').each(function(index,item){
			if(index!=2){
				$(item).children('span').eq(0).html(oldTime.charAt(index));
			}
		})
	}
	
	//获取当前时间
	function getTime(){
		var date = new Date();
		var h = date.getHours();
		var m = date.getMinutes();
		var s = date.getSeconds();
		var str = toDouble(h) + ':' + toDouble(m) + ':' + toDouble(s); 
		$('#timer p:eq(0)').html(str);
		return str;
	}

	//获取日期
	function getDates(){ 
		var date = new Date();
		var year = date.getFullYear();
		var month = date.getMonth();
		var day = date.getDate();
		var week = daySwitch(date.getDay());
		var str = year+'年'+(month+1)+'月'+day+'日&nbsp'+week;

		calender(year,month);
		$('#calender .dateOption').html(year+'年'+(month+1)+'月');
		$('#timer p:eq(1)').html(str);
		$('.years').html((month+1)+'月'+day+'日');
		$('.week').html(week);
	}

	//上一分钟与下一分钟比较，判断哪位数需要翻页
	setInterval(function(){
		var newTime = getTime();
		for(var i=0;i<5;i++){
			if(oldTime.charAt(i) != newTime.charAt(i)){
				pageTurning(i,newTime.charAt(i));
			}
		}
		oldTime = newTime;
	},1000)
	
	//翻页效果
	function pageTurning(index,t){
		var oLi = $('.dateTime li').eq(index);
		oLi.children('span').eq(1).html(t);
		move(oLi.get(0),{top:-70},500,'linear',function(){
			oLi.children('span').eq(0).html(t);
			oLi.css('top','');
		})
	}
	// 上一月
	var date = new Date();
	var y = date.getFullYear();
	var m = date.getMonth();
	$('.lastMonth').on('click',function(e){
		e.stopPropagation();
		m--;
		if(m<0){
			m = 11;
			y--;
		}
		calender(y,m);
		$('#calender .dateOption').html(y+'年'+(m+1)+'月');
	})

	// 下一月
	$('.nextMonth').on('click',function(e){
		e.stopPropagation();
		m++;
		if(m==12){
			m=0;
			y++;
		}
		calender(y,m);
		$('#calender .dateOption').html(y+'年'+(m+1)+'月');
	})
	
	//渲染日历
	function calender(y,m){
		var num = 42;
		var str = '';
		var date = new Date(new Date(y,m).setDate(0));	 //上个月有多少天
		var n1 =  date.getDate();	
		var date = new Date(y,m,1);		//本月1号是星期几
		var n2 =  date.getDay();	

		for(var i=0; i<n2; i++){
			str = '<li class="gray">'+n1+'</li>'+str;
			n1--;
			num--;
		}
		
		var date = new Date(new Date(y,m+1).setDate(0));	//本月共多少天
		var n3 =  date.getDate();
		var now = new Date().getDate();		//今天是多少号
		
		for(var i=0; i<n3; i++){
			if((i+1) == now){
				str += '<li class="active">'+(i+1)+'</li>';
			}else{
				str += '<li>'+(i+1)+'</li>';
			}
			num--;
		}
		for(var i=0; i<num; i++){
			str += '<li class="gray">'+(i+1)+'</li>';
		}
		$('#calender .month').html(str);
	}

	//一位数补成两位数
	function toDouble(n){
		return n<10?'0'+n:''+n;
	}

	//星期转换
	function daySwitch(n){
		switch(n){
			case 0: return '星期日';
			case 1: return '星期一';
			case 2: return '星期二';
			case 3: return '星期三';
			case 4: return '星期四';
			case 5: return '星期五';
			case 6: return '星期六';
		}
	}

	
	//关闭小工具
	$('#tools').on({
		mouseover:function(e){
			$('.toolsName').css('visibility','visible');
		},
		mouseout:function(){
			$('.toolsName').css('visibility','hidden');
		}
	})
	$('.toolClose').on({
		click:function(){
			$('#tools').hide()
		}
	})