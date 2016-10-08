var KEY = {
	UP: 38,
	DOWN: 40,
	W: 87,
	S: 83
};

var pingpong = {
	scoreA : 0,
	scoreB : 0
};
pingpong.pressKeys = [];
pingpong.ball = {
	speed: 5,
	x: 150,
	y: 100,
	directionX: 1,
	directionY: 1
};

$(function(){
	//设置interval用于每30ms调用一次gameloop
	pingpong.timer = setInterval(gameloop, 30);

	//标记下pressedKeys数组里的某键的状态是按下还是放开
	$(document).keydown(function(e){
		pingpong.pressKeys[e.which] = true;
	});
	$(document).keyup(function(e){
		pingpong.pressKeys[e.which] = false;
	});

});

//游戏主循环. 每秒执行33.3次
function gameloop(){
	moveBall();
	movePaddles();
}

function moveBall(){
	var playgroundHeight = parseInt($("#playground").height());
	var playgroundWidth = parseInt($("#playground").width());
	var ball = pingpong.ball;

	//检测球台边缘
	//检测底边
	if(ball.y + ball.speed*ball.directionY > playgroundHeight){
		ball.directionY = -1;
	}
	//检测顶边
	if(ball.y + ball.speed*ball.directionY <0){
		ball.directionY = 1;
	}
	//检测右边
	if(ball.x + ball.speed*ball.directionX > playgroundWidth){
		//玩家B丢分
		//重置乒乓球
		pingpong.scoreA++;
		$("#scoreA").html(pingpong.scoreA);
		ball.x = 250;
		ball.y = 100;
		$('#ball').css({
			"left": ball.x,
			"top" : ball.y
		});
		ball.directionX = -1;
	}
	//检测左边
	if(ball.x + ball.speed*ball.directionX < 0){
		//玩家A丢分
		pingpong.scoreB++;
		$("#scoreA").html(pingpong.scoreB);
		ball.x = 150;
		ball.y = 100;
		$("#ball").css({
			"left" : ball.x,
			"top" : ball.y
		})
		ball.directionX = 1;
	}
	ball.x += ball.speed * ball.directionX;
	ball.y += ball.speed * ball.directionY;

	//检测球拍
	//检测左侧球拍
	var paddleAX = parseInt($('#paddleA').css('left')) + parseInt($('#paddleA').css("width"));
	var paddleAYBottom = parseInt($("#paddleA").css("top")) + parseInt($('#paddleA').css("height"));
	var paddleAYTop = parseInt($('#paddleA').css('top'));
	console.log(paddleAYBottom);
	console.log(paddleAYTop);
	if(ball.y + ball.speed * ball.directionY <= paddleAYBottom && ball.y +ball.speed * ball.directionY >= paddleAYTop){
		ball.directionX = 1;
	}
	//检测右侧球拍
	var paddleBX = parseInt($('#paddleB').css('left'));
	var paddleBYBottom = parseInt($("#paddleB").css("top")) + parseInt($('#paddleB').css("height"));
	var paddleBYTop = parseInt($('#paddleB').css('top'));
	if(ball.y + ball.speed * ball.directionY <= paddleBYBottom && ball.y + ball.speed * ball.directionY >= paddleBYTop){
		ball.directionX = -1;
	}
	//根据速度与方向移动乒乓球
	$('#ball').css({
		"left" : ball.x,
		"top" : ball.y
	})

}
function movePaddles(){
	//使用自定义定时器不断检测是否有按键被按下
	if(pingpong.pressKeys[KEY.UP]){		//向上键
		//获取球拍B的当前top值并转化为Int类型
		var top = parseInt($('#paddleB').css("top"));
		//球拍B向上移动5个像素
		$('#paddleB').css("top",top-5);
	}
	if(pingpong.pressKeys[KEY.DOWN]){	//向下键
		//获取球拍B的当前top值并转化为Int类型
		var top = parseInt($('#paddleB').css("top"));
		//球拍B向下移动5个像素
		$('#paddleB').css("top",top+5);
	}
	if(pingpong.pressKeys[KEY.W]){		//W键
		//获取球拍A的当前top值并转化为Int类型
		var top = parseInt($('#paddleA').css("top"));
		//球拍A向上移动5个像素
		$('#paddleA').css("top",top-5);
	}
	if(pingpong.pressKeys[KEY.S]){		//S键
		//获取球拍A的当前top值并转化为Int类型
		var top = parseInt($('#paddleA').css("top"));
		//球拍A向下移动5个像素
		$('#paddleA').css("top",top+5);
	}
}