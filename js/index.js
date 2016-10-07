

var untangleGame = {
    circles : [],
    thinLineThickness: 1,
    boldLineThickness: 5,
    lines: [],
    currentLevel: 0,
    progressPercentage: 0,
    circleRadius: 10,
    layers: []
};

untangleGame.levels = [
    {
        "level" : 0,
        "circles" : [{"x": 600, "y" : 356},
                {"x" : 581, "y" : 441},
                {"x" : 284, "y" : 433},
                {"x" : 288, "y" : 273}],
        "relationship" : {
                "0" : {"connectedPoints" : [1,2]},
                "1" : {"connectedPoints" : [0,3]},
                "2" : {"connectedPoints" : [0,3]},
                "3" : {"connectedPoints" : [1,2]}
        }
    },
    {
        "level" : 1,
        "circles" : [{"x": 401, "y" : 273},
                {"x" : 600, "y" : 440},
                {"x" : 288, "y" : 441},
                {"x" : 284, "y" : 272}],
        "relationship" : {
                "0" : {"connectedPoints" : [1,2,3]},
                "1" : {"connectedPoints" : [0,2,3]},
                "2" : {"connectedPoints" : [0,1,3]},
                "3" : {"connectedPoints" : [0,1,2]}
        }
    },
    {
        "level" : 2,
        "circles" : [{"x": 292, "y" : 285},
                {"x" : 453, "y" : 213},
                {"x" : 593, "y" : 286},
                {"x" : 490, "y" : 414},
                {"x" : 448, "y" : 475},
                {"x" : 295, "y" : 416}],
        "relationship" : {
                "0" : {"connectedPoints" : [2,3,4]},
                "1" : {"connectedPoints" : [3,5]},
                "2" : {"connectedPoints" : [0,4,5]},
                "3" : {"connectedPoints" : [0,1,5]},
                "4" : {"connectedPoints" : [0,2]},
                "5" : {"connectedPoints" : [1,2,3]}
        }
    }
];

function Circle(x,y,radius){
    this.x = x;
    this.y = y;
    this.radius = radius;
}

function Line(startPoint, endPoint, thickness) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.thickness = thickness;
}

$(function(){
    //layer1 背景
    var canvas_bg = document.getElementById("bg");
    untangleGame.layers[0] = canvas_bg.getContext("2d");

    //layer2 指南
    var canvas_guide = document.getElementById("guide");
    untangleGame.layers[1] = canvas_guide.getContext("2d");
    
    //layer3 游戏
    var canvas_game = document.getElementById("game");
    untangleGame.layers[2] = canvas_game.getContext("2d");
    
    //layer4 ui
    var canvas_ui = document.getElementById("ui");
    untangleGame.layers[3] = canvas_ui.getContext("2d");

    //layer5 title
    var canvas_title = document.getElementById("title");
    untangleGame.layers[4] = canvas_title.getContext("2d");
    
    setupCurrentLevel();
    connectCircles();
    
    //给canvas添加鼠标监听事件
    //检查按下鼠标的位置是否在任何一个圆上
    //并设置那个圆为拖曳目标小球
    $("#layers").mousedown(function(e){
        var canvasPosition = $(this).offset();
        var mouseX = (e.pageX - canvasPosition.left) || 0;
        var mouseY = (e.pageY - canvasPosition.top) || 0;
        for(var i=0; i<untangleGame.circles.length; i++){
            var circleX = untangleGame.circles[i].x;
            var circleY = untangleGame.circles[i].y;
            var radius = untangleGame.circles[i].radius;
            if(Math.pow(mouseX-circleX, 2) + Math.pow(mouseY-circleY, 2)<Math.pow(radius,2)){
                untangleGame.targetCircle = i;
                break;
            }
        }
    });
    $("#layers").mousemove(function(e){
        if(untangleGame.targetCircle != undefined){
            var canvasPosition = $(this).offset();
            var mouseX = (e.pageX - canvasPosition.left) || 0;
            var mouseY = (e.pageY - canvasPosition.top) || 0;
            var radius = untangleGame.circles[untangleGame.targetCircle].radius;
            untangleGame.circles[untangleGame.targetCircle] = new Circle(mouseX,mouseY,radius);
        }
        connectCircles();
        updateLineIntersection();
        updateLevelProgress();
    });
    
    $("#layers").mouseup(function(e){
        untangleGame.targetCircle = undefined;
        checkLevelCompleteness();
    });

    // var bg_gradient = ctx.createLinearGradient(0,0,0,ctx.canvas.height);
    // bg_gradient.addColorStop(0,"#ccc");
    // bg_gradient.addColorStop(1,"#efefef");
    // ctx.fillStyle = bg_gradient;
    // ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);

    var ctx = untangleGame.layers[0];
    ctx.textAlign = "center";
    ctx.fillStyle = "#333";
    ctx.fillText("loading...",ctx.canvas.width/2,ctx.canvas.height/2);

    untangleGame.background = new Image();
    untangleGame.background.onload = function(){
        drawLayerBG();
    
        //设置游戏主循环轮巡间隔
        untangleGame.timer = setInterval(gameloop, 30);
    }
    untangleGame.background.onerror = function(){
        console.log("Error loading the image");
    }   
    untangleGame.background.src = "img/bg1.png";
});



function drawLine(ctx, x1, y1, x2, y2, thickness){
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = "#cfc";
    ctx.stroke();
}
function drawCircle(ctx,x,y,radius){
    var circle_gradient = ctx.createRadialGradient(x-3,y-3,1,x,y,radius);
    circle_gradient.addColorStop(0,"#fff");
    circle_gradient.addColorStop(1,"#cccc00");
    ctx.fillStyle = circle_gradient;

    ctx.beginPath();
    //arc参数： x、y轴圆弧中心点， 半径，弧度起点、终点，顺时针(false),逆时针(true)
    ctx.arc(x, y, radius, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
}

function gameloop(){
    drawLayerGuide();
    drawLayerGame();
    drawLayerUI();
    drawLayerTitle();
}

//绘制背景
function drawLayerBG(){
    var ctx = untangleGame.layers[0];
    clear(ctx);
    ctx.drawImage(untangleGame.background, 0, 0);
}

//绘制指导动画
function drawLayerGuide(){
    var ctx = untangleGame.layers[1];
    clear(ctx);

    if(untangleGame.guideReady){

    }

    if(untangleGame.currentLevel == 1){
        $("#guide").addClass('fadeout');
    }
}

function drawLayerGame(){
    var ctx = untangleGame.layers[2];

    //绘制可视的游戏状态
    //绘制前先清除canvas
    clear(ctx);

    for(var i = 0; i<untangleGame.lines.length; i++){
        var line = untangleGame.lines[i];
        var startPoint = line.startPoint;
        var endPoint = line.endPoint;
        var thickness = line.thickness;
        drawLine(ctx, startPoint.x, startPoint.y, endPoint.x, endPoint.y, thickness);
    }

    for(var i=0; i<untangleGame.circles.length; i++){
        var circle = untangleGame.circles[i];
        drawCircle(ctx, circle.x, circle.y, circle.radius);
    }
}

function drawLayerUI(){
    var ctx = untangleGame.layers[3];
    clear(ctx);

    //绘制关卡进度文本
    ctx.font = "26px Rock Salt";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";     //文本对齐方式
    ctx.textBaseline = "bottom";        //基线
    ctx.fillText("Puzzle "+(untangleGame.currentLevel+1)+",  Completeness " + untangleGame.progressPercentage + "%", 35, ctx.canvas.height-25);

    var isOverlappedWithCircle = false;
    for(var i in untangleGame.circles){
        var point = untangleGame.circles[i];
        if(point.y > 673){
            isOverlappedWithCircle = true;
        }
    }
    if(isOverlappedWithCircle){
        $("#ui").addClass('dim');
    } else {
        $("#ui").removeClass("dim");
    }
}

function drawLayerTitle(){
    var ctx = untangleGame.layers[4];
    clear(ctx);

    ctx.font = "36px Rock Salt";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Untangle Game", ctx.canvas.width/2,120);

    var isOverlappedWithCircle = false;
    for(var i in untangleGame.circles){
        var point = untangleGame.circles[i];
        if(point.y < 107){
            isOverlappedWithCircle = true;
        }
    }
    if(isOverlappedWithCircle){
        $("#title").addClass('dim');
    } else {
        $("#title").removeClass("dim");
    }

}

function clear(ctx){
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
}

function connectCircles(){
    //每个圆用线相互连接
    var level = untangleGame.levels[untangleGame.currentLevel];
    untangleGame.lines.length = 0;
    for(var i in level.relationship){
        var connectedPoints = level.relationship[i].connectedPoints;
        var startPoint = untangleGame.circles[i];
        for(var j in connectedPoints){
            var endPoint = untangleGame.circles[connectedPoints[j]];
            untangleGame.lines.push(new Line(startPoint, endPoint, untangleGame.thinLineThickness));
        }
    }
    updateLineIntersection();
}

function isIntersect(line1, line2){
    //ax + by = c
    var a1 = line1.endPoint.y - line1.startPoint.y;
    var b1 = line1.startPoint.x - line1.endPoint.x;
    var c1 = a1*line1.startPoint.x + b1*line1.startPoint.y;

    var a2 = line2.endPoint.y - line2.startPoint.y;
    var b2 = line2.startPoint.x - line2.endPoint.x;
    var c2 = a2*line2.startPoint.x + b2*line2.startPoint.y;

    //计算交点
    var d = a1*b2 - a2*b1;

    //当d=0时，两线平行
    if(d==0){
        return false;
    } else {
        var x = (b2*c1 - b1*c2) / d;
        var y = (a1*c2 - a2*c1) / d;
        //检测截点是否在两条线段之上
        if((isInBetween(line1.startPoint.x, x, line1.endPoint.x) ||
            isInBetween(line1.startPoint.y, y, line1.endPoint.y)) &&
            (isInBetween(line2.startPoint.x, x, line2.endPoint.x) ||
            isInBetween(line2.startPoint.y, y, line2.endPoint.y))){
            return true;
        }
    }
    return false;
}

//如果b在a和c之间则返回true
//当a==b或b==c时排除结果，返回false
function isInBetween(a,b,c){
    //如果b几乎等于a或c，返回false
    if(Math.abs(a-b) < 0.000001 || Math.abs(b-c) < 0.000001){
        return false;
    }
    //如果b在a和c之间返回true
    return (a<b && b<c) || (c<b && b<a);
}
//检测相交线并把这些线加粗
function updateLineIntersection(){
    //检测相交的线并加粗
    for(var i = 0; i<untangleGame.lines.length; i++){
        for(var j = 0; j<i; j++){
            var line1 = untangleGame.lines[i];
            var line2 = untangleGame.lines[j];

            //如果检测到两条线相交， 将加粗该线
            if(isIntersect(line1, line2)){
                line1.thickness = untangleGame.boldLineThickness;
                line2.thickness = untangleGame.boldLineThickness;
            }
        }
    }
}

function setupCurrentLevel(){
    untangleGame.circles = [];
    var level = untangleGame.levels[untangleGame.currentLevel];
    for (var i=0; i<level.circles.length; i++){
        untangleGame.circles.push(new Circle(level.circles[i].x, level.circles[i].y, 10));
    }

    // 设置圆之后再设置连接线数据
    connectCircles();
    updateLineIntersection();
}

function checkLevelCompleteness() {
    if (untangleGame.progressPercentage == "100"){
        //  if(untangleGame.currentLevel + 1 < untangleGame.levels.length)
            untangleGame.currentLevel++;
        if(untangleGame.currentLevel == untangleGame.levels.length){
            //timer = null;
            if(confirm("恭喜你通关了！是否重新开始游戏？")){
                untangleGame.currentLevel = 0;
                setupCurrentLevel();
            } else {
                untangleGame.timer = null;
                $("#layers").unbind();
            }
        } else {
            setupCurrentLevel();
        }
        
    }
}

function updateLevelProgress(){
    //检测当前关卡的解题进度
    var progress = 0;
    for(var i=0; i<untangleGame.lines.length; i++){
        if(untangleGame.lines[i].thickness == untangleGame.thinLineThickness){
            progress++;
        }
    }
    var progressPercentage = Math.floor(progress/untangleGame.lines.length*100);
    //$("#progress").html(progressPercentage);
    untangleGame.progressPercentage = progressPercentage;
    //显示当前关卡
    $("#level").html(untangleGame.currentLevel+1);
}