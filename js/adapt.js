//渲染数据
var datas = store('dataset');
renderAll();
function renderAll(){
	$.each(datas,function(index,item){
		render(item);
	})
}


//生成DOM结构
function render(data){
	var str = `<div class="deskIco ${data.type}" num="${data.num}">
					<div></div>
					<span>${data.name}</span>
				</div>`;
	$('#desk').append(str);
}

var oWidth = $('.deskIco').eq(0).innerHeight()+10;
layout();
//调整浏览器窗口大小，布局自适应
$(window).resize(function(){
	layout();
})

//桌面图标位置确定
function layout(){
	$('.deskIco').stop(true);
	var yNum = Math.floor($(window).innerHeight()/oWidth);
	$('.deskIco').each(function(index,item){
		var left = Math.floor(index/yNum)*oWidth+20;
		var top = Math.floor(index%yNum)*oWidth+20;
		var l = Math.floor($(this).offset().left);
		var t = Math.floor($(this).offset().top);
		
		if(l==left&&t==top){
			return;
		}else{
			$(this).animate({
				top:top,
				left:left
			})
		}
	});
}



//打开日历
$('.calender').on('dblclick',function(){
	$('#calenderTool').show();
})

//点击桌面其他地方，日历隐藏
$(document).on('click',function(){
	$('#calenderTool').hide();
	$('#contextmenu').hide();
})

/***************************右键菜单*******************************/
var fileId = 0;
$(document).on('contextmenu',function(e){
	e.preventDefault();
	if($(e.target).parents('.deskIco').get(0)){
		
	}

	//菜单内容配置：如果是文件，文件菜单显示
	if($(e.target).parents('.file').get(0)){	
		$('#contextmenu li').show();
		fileId = $(e.target).parents('.file').attr('num');
	}else{
		$('.filemenu').hide();
	}

	//右键菜单定位位置确定
	var l = e.clientX;
	var t = e.clientY;
	if(l+$('#contextmenu').outerWidth()>window.innerWidth){
		l = window.innerWidth - $('#contextmenu').outerWidth();
	}
	if(t+$('#contextmenu').outerHeight()>window.innerHeight){
		t = t - $('#contextmenu').outerHeight();
	}

	$('#contextmenu').css({
		left:l,
		top:t
	}).show();
})

$('#contextmenu').on('click',function(e){
	var target = e.target;
	if($(target).hasClass('newFile')){	//新建文件夹
		var obj = {
			num:maxNum(),
	        name:chaxun('新建文件夹'),
	        type:'file'
		}
		datas.push(obj);
		render(obj);
		layout();
		store('dataset',datas);
	}else if($(target).hasClass('removeFile')){		//删除文件夹

		for(var i=0; i<datas.length; i++){
			if(datas[i].num == fileId){
				datas.splice(i,1);
				break;
			}
		}
		$('.file').remove(`.file[num=${fileId}]`)
		layout();
		store('dataset',datas);
	}else if($(target).hasClass('rename')){		//重命名文件夹
		var node = $(`.file[num=${fileId}]>span`);

		var cte = node.html();
		var l = node.offset().left;
		var t = node.offset().top;
		$('#desk input').show().css({
			left:l,
			top:t
		}).val(cte);
		node.hide();
		// datas[fileId].num = 
		store('dataset',datas);
	}else if($(target).hasClass('clearStorage')){	//清除本地缓存
		localStorage.clear();
	}
})

//查询最大的num
function maxNum(){
	var max = datas[0].num;
	for(var i=0; i<datas.length; i++){
		if(datas[i].num>max){
			max = datas[i].num;
		}
	}
	return max+1;
}

/***************************设置、获取localStorage**************************/
function store(key,data){
	if (data) {
        return localStorage.setItem(key, JSON.stringify(data));
    }
    var store = localStorage.getItem(key);
    return (store && JSON.parse(store)) || datass;
}



//查询文件夹是否有重名，重名+（i）
function chaxun(value){ 
	var n=0;
	var arr = [];
	for(var i=0; i<datas.length; i++){	//判断是否有重名
		if(datas[i].name == value){
			n++;
			arr.push(1);
			break;
		}
	}
	if( n==0 ){
		return value;
	}else{
		for(var i=0; i<datas.length; i++){	//检测序号
			for(var j=1; j<datas.length; j++){
				if(datas[i].name == value+'('+j+')'){
					arr.push(j+1);
				}
			}
		}
		arr.sort(function(a,b){
			return a-b;//[1,4,6]
		});
		for(var i=0; i<arr.length; i++){
			if(arr[i]!=(i+1)){
				return value+'('+i+')';
			}
		}
		return value+'('+arr[arr.length-1]+')';
	}
}
//
$('#desk').on({
	mouseover:function(e){
		if($(e.target).parents('.deskIco')[0]){
			$(e.target).parents('.deskIco').addClass('active');
		}
		$('.deskIco').each(function(index,item){
			drag($(item));
		})
	},
	mouseout:function(e){
		if($(e.target).parents('.deskIco')[0]){
			$(e.target).parents('.deskIco').removeClass('active');
		}
	}
})


//拖拽
function drag(obj){
	obj.on('mousedown',function(e){
		var disx = e.clientX - obj.offset().left;
		var disy = e.clientY - obj.offset().top

		$(document).on({
			mousemove:function(e){
				obj.css('zIndex',100);
				var l = e.clientX - disx;
				var t = e.clientY - disy;

				//确定可拖动范围
				var maxLeft = $(window).innerWidth() - obj.outerWidth();
				var maxTop = $(window).innerHeight() - obj.outerHeight();
				l = l<0 ? 0 : l;
				l = l>maxLeft ? maxLeft : l;
				t = t<0 ? 0 : t;
				t = t>maxTop ? maxTop : t;

				obj.css({
					left:l,
					top:t
				})
				$('.deskIco').removeClass('active');
				obj.id = null;
				$.each($('.deskIco'),function(index,item){
					if(pZ(obj[0],item)){
						$(obj).addClass('active');
						$(item).addClass('active');
						if(!obj.hasClass('recycle')){ //拖动的不是回收站
							if(pZ($('.recycle')[0],obj[0])){
								obj.id = $(obj).attr('num');
							}
						}
					}
				})
			
				
			},
			mouseup:function(){
				if(obj.id){
					for(var i=0; i<datas.length; i++){
						if(datas[i].num == obj.id){
							datas.splice(i,1);
							break;
						}
					}
					$('.deskIco').remove(`.deskIco[num=${obj.id}]`)
					layout();
					store('dataset',datas);
				}
				$('.deskIco').removeClass('active');
				obj.css('zIndex','');
				$(this).off({
					mousemove:null,
					mouseup:null
				})
			}
		})
		// return false;
	})
}

// 碰撞检测
function pZ(obj1,obj2){
	var pos1 = obj1.getBoundingClientRect();
	var pos2 = obj2.getBoundingClientRect();
	if(pos1.right < pos2.left || pos1.bottom < pos2.top || pos1.left > pos2.right || pos1.top > pos2.bottom){
		return false;
	}else{
		return true;
	}
}

