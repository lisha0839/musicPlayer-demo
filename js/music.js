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
audio[0].play();


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
    //     return;
    // }else{
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
    // timeupdate:function(){
    //     var l = Math.round( progMax / audio[0].duration * audio[0].currentTime );  
    //     if(!isDrag){    //拖动进度条音乐正常播放
    //         setStyle( $('.progress'), l )
    //         curTime.html(format(audio[0].currentTime));
    //     }         
    // },

    //自动播放下一首，列表播放结束，播放第一首
    ended:function(){
        nextSong();
    }

})

/*************获取本地文件地址************/
fileBtn.on('change',function(){    //点击加载本地文件
    var f = this.files[0];
    m1.upload(f);
    getSrc( this )
});

function getSrc( node ){
    // console.log(node.files) 文件名
    // console.log(node.files.item(0).name)
    var file = node.files[0] || node.files.item(0); //后者为兼容火狐
    var url = window.URL.createObjectURL(file);
    audio.prop('src',url);
    audio[0].play();
}







var Music = function(){
    this.ac = new (window.AudioContext||window.webkitAudioContext)();
    this.status = 0;    //当前是否有音乐正在播放，0无，1有
}
Music.prototype = {
    constructor:Music,

    /*上传文件*/
    upload:function(file){     
        var that = this;
        var fr = new FileReader();
        fr.onload = function(e){
            if(that.status>0){
                that.stop();
            }
            that.decode(e.target.result);
            that.status = 1;
        };
        fr.readAsArrayBuffer(file);     //解析为二进制数组形式
    },
   
    /*解析文件*/
    decode:function(data){
        var that = this;
        this.ac.decodeAudioData(data,function(buffer){    //异步解码音频文件中的 ArrayBuffer
            var source = that.ac.createBufferSource();  //创建音频输出节点
            var analyser = that.ac.createAnalyser();    //创建频谱分析对象
            source.connect(analyser);
            analyser.connect(that.ac.destination);
            source.buffer = buffer;

            that.source = source;
            that.analyser = analyser;
            // that.play();
        },function(error){
            console.log(error);
        });
    },
    play:function(){
        this.status = 1;    //说明有音乐正在播放
        this.source.start(0);
    },
    stop:function(){
        this.status = 0;
        this.source.stop(0);  
    }
}

var m1 = new Music();

