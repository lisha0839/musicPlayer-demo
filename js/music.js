var audio = $('#audio');
var fileBtn = $('#localFile');
var musics = $('.musics');
var prevBtn = $('.previous');
var playBtn = $('.play');
var nextBtn = $('.next');
var bugle = $('.bugle');
var volumeBtn = $('.volume');
var volWidth = $('.volume').innerWidth();

var progress = $('.progress');
var progWidth = $('.progress').innerWidth();
var curTime = $('.currentTime');
var talTime = $('.totalTime');
var dotWidth = $('.volume p').innerWidth();
var numlist = 0;
var state = 1;
var isDrag = 0;
var volMax = volWidth - dotWidth;
var progMax = progWidth - dotWidth;


$('.music').on('dblclick',function(){
    $('#music').show();
    numlist = 0;
    audio[0].currentTime = 0;
    audio[0].volume = 1;
    setStyle( $('.volume'), audio[0].volume * volMax );
    songSrc(numlist); 
    playState();   
})


$('#music .musicClose').on('click',function(){
    $('#music').hide();
    audio[0].pause();  
    pauseState();
})
/****************播放与暂停**************/
playBtn.on('click',function(){
    if(!state){   
        audio[0].play();
        playState();
    }else{
        audio[0].pause();
        pauseState();
    }
})
function playState(){
    state = 1;
    playBtn.addClass('active');
}
function pauseState(){
    state = 0;
    playBtn.removeClass('active');
}
/*****************上一曲*****************/
prevBtn.on('click',function(){
    numlist--;
    if(numlist<0){
        numlist = 0;
    }
    playState();
    songSrc(numlist);
})

/*****************下一曲*****************/
nextBtn.on('click',function(){
    playState();
    nextSong(); 
})

function nextSong(){
    numlist++;
    var len = $('.musics li').length-1;
    if(numlist==len){
        numlist = 0;
    }
    songSrc(numlist);
}
        
/***************点击列表切换音乐*********/
musics.on('click',function(e){  
    if($(e.target).is('li')){
        numlist = $('.musics li').index($(e.target));
        songSrc(numlist);  
    }
})

function songSrc(n){    //获取歌曲地址
    $('.musics .active').removeClass('active');
    var str = $('.musics li').eq(n).addClass('active').html();
    audio.prop('src','src/mp3/'+str+'.mp3');
    audio[0].play();
}

/********调节进度：点击进度条、拖动********/
progress.on('click',function(e){
    var t = sliderRange( progress, e.clientX, progMax ) / progMax * audio[0].duration;
    audio[0].currentTime = t;
    curTime.html(format(t));   
})

$('.progress p').on('mousedown',function(e){
    isDrag = 1;
    var t = 0;
    $(document).on({
        mousemove:function(e){
            t = sliderRange( progress, e.clientX, progMax ) / progMax * audio[0].duration; 
            curTime.html(format(t)); 
        },
        mouseup:function(){
            isDrag = 0;
            audio[0].currentTime = t;
            $(this).off({
                mousemove:null,
                mouseup:null
            })
        }
    })
})

function sliderRange(obj, x, Max){  //确定dot位置，及范围
    var l = x - obj.offset().left;
    if(l<0){
        l = 0;
    }
    if(l>Max){
        l = Max;
    } 
    setStyle( obj, l );
    return l;
}

function setStyle(obj,n){   //设置滑杆的dot的left,进度的width
    obj.children('span').css('width',n);
    obj.children('p').css('left',n);
}

/***************是否静音*****************/
bugle.on('click',function(){
    if(!audio[0].muted){
        setStyle( $('.volume'), 0 );    //根据音量,确定em\span的位置
    }else{
        setStyle( $('.volume'), audio[0].volume * volMax );    //根据音量,确定em\span的位置
    }
    audio[0].muted = !audio[0].muted;
})

/********调节音量：点击音量条、拖动********/
volumeBtn.on('click',function(e){
    audio[0].volume = sliderRange( volumeBtn, e.clientX, volMax ) / volMax;
})

$('.volume p').on('mousedown',function(e){     //根据em的位置,确定音量
    $(document).on({
        mousemove:function(e){
            audio[0].volume = sliderRange( volumeBtn, e.clientX, volMax ) / volMax;
        },
        mouseup:function(){
            $(this).off({
                mousemove:null,
                mouseup:null
            })
        }
    })
})

/***********设置显示时间样式************/
function format(time){
    var m = Math.floor(time/60);
    var s = Math.floor(time%60);
    return toDouble(m)+':'+toDouble(s);
}

function toDouble(n){   //单数变双数，3变为03
    return n < 10 ? "0"+n : ''+n;
}

/***************audio事件**************/
audio.on({

    //数据加载完成，显示歌曲总时间
    loadeddata:function(){
        talTime.html(format(audio[0].duration));
    },

    //播放中，设置滑杆进度和当前播放时间
    timeupdate:function(){
        var l = Math.round( progMax / audio[0].duration * audio[0].currentTime );  
        if(!isDrag){    //拖动进度条音乐正常播放
            setStyle( $('.progress'), l )
            curTime.html(format(audio[0].currentTime));
        }         
    },
    play:function(){console.log(1)
        draw();
    },

    //自动播放下一首，列表播放结束，播放第一首
    ended:function(){
        nextSong();
    }

})

/*************获取本地文件地址************/
fileBtn.on('change',function(){    //点击加载本地文件
    var f = this.files[0] || this.files.item(0);    //后者为兼容火狐
    if(f.type.indexOf('audio') != -1){  //确保上传的是音频文件
        getSrc( f );
        playState();
    }else{
        alert('请上传音乐文件')
    }
    
    
});

function getSrc( file ){
    // console.log(node.files) 文件名
    // console.log(node.files.item(0).name)
    var url = window.URL.createObjectURL(file);
    audio.prop('src',url);
    audio[0].play();
}

var ac = new (window.AudioContext||window.webkitAudioContext)();
var source = ac.createMediaElementSource(audio[0]);  //创建音频节点源
var analyser = ac.createAnalyser();    //创建频谱分析对象
source.connect(analyser);
analyser.connect(ac.destination);


var cans1 = $('#c1')[0].getContext('2d');
var cansW = $('#c1')[0].width;
var cansH = $('#c1')[0].height;
function draw(){
    var data = new Uint8Array(analyser.frequencyBinCount);
    var gradient1 =cans1.createLinearGradient(0, 0, 0, 210);
        gradient1.addColorStop(0, "rgba(255, 0, 0,1)");
        gradient1.addColorStop(0.8, "rgba(0, 255, 0,0.9)");  
        gradient1.addColorStop(1, "rgba(0, 0, 255,0.9)");
    var gradient2 = cans1.createLinearGradient(0, 0, 0, 150);
        gradient2.addColorStop(1, "rgba(255, 120, 120, 0.3)");
        gradient2.addColorStop(0.5, "rgba(120, 255, 120, 0.6)");    
        gradient2.addColorStop(0, "rgba(120, 120, 255, 1)");

    (function(){
        var arg = arguments;
        var fId = requestAnimationFrame(function(){  
            analyser.getByteFrequencyData(data);
            cans1.clearRect(0, 0, cansW, cansH);
            for(var i=0; i<1024; i=i+2){
                cans1.fillStyle = gradient1;
                cans1.fillRect(i*2, cansH/2-data[i], 1, data[i]);                  
                cans1.save();
                cans1.translate(0, cansH/2);                   
                cans1.fillStyle = gradient2;
                cans1.fillRect(i*2, 0, 1, data[i]);            
                cans1.restore();
            } 
            arg.callee();
        })
    })();
}
var searchData = null;
$('.musicSearch').on('input',function(){
    if(this.value){
        searchData = {
            q:$('.musicSearch').val(),
            page:1,
            size:3
        }
        getSong()
    }
})

function getSong(){
    $.ajax({
        type : 'get',
        url : 'http://so.ard.iyyin.com/s/song_with_out',
        data:searchData,
        dataType : 'jsonp',
        jsonpCallback:"showWeather",
        success : function(data){
            if(data.code == 1){
                song(data.data[0])
            }else{
                console.log('获取失败')
            }
         },
        error:function(){
             alert('请求失败');
        }
     });
}

 
 function song(data){
    console.log(data.url_list[1].url)
    audio[0].src = ' ';
    try{
        // audio[0].play();
    }catch(error){
        // console.log('不能播放')
    }


    
 }



