var c, ctx, FPS, socket, ID;

var users = [];

var balls = [];

var paddle1 = {
	pos: {x: 0, y: 0},
	size: {x: 20, y: 100},
	points: 0,
}

var paddle2 = {
	pos: {x: 1000, y: 0},
	size: {x: -20, y: 100},
	points: 0,
};


function drawPaddles(){
	ctx.fillStyle="white";
	ctx.fillRect(paddle1.pos.x, paddle1.pos.y, 20, 100);
	ctx.fillRect(paddle2.pos.x, paddle2.pos.y, -20, 100);
	ctx.font="70px Arial";
	ctx.fillText(paddle1.points + ":" + paddle2.points, c.width/2-50, 100);
}

function drawBalls(){
	balls.forEach(function(ball){
		ctx.fillStyle="white";
		ctx.fillRect(ball.pos.x, ball.pos.y, ball.size, ball.size);
	});
}

function getMousePos(canvas, e) {
    var rect = canvas.getBoundingClientRect(), root = document.documentElement;
    var mouseX = e.pageX - rect.left - root.scrollLeft;
    var mouseY = e.pageY - rect.top - root.scrollTop;
    return {
      x: mouseX,
      y: mouseY
    };
  }


function handleMouseMove(e){
	var mouse = getMousePos(c, e);
	if(users[0] === ID){
		paddle1.pos.y = mouse.y - paddle1.size.y/2;
	}
	else if(users[1] === ID){
		paddle2.pos.y = mouse.y - paddle2.size.y/2;
	}
}

function setId(data){
	ID = data;
}

function start(){
	socket = io.connect("http://localhost:3000");
	socket.on("update", updateData);
	socket.on("id", setId);
	c = document.getElementById("mainCanvas");
	ctx = c.getContext("2d");
	c.width = 1000;
	c.height = 600;
	paddle1.pos = {x: 0, y: c.height/2,};
	paddle2.pos = {x: c.width, y: c.height/2,}
	FPS = 30;
	mainLoop();
	c.addEventListener("mousemove", handleMouseMove);
}

window.onload = start();


function updateData(data){
	users = data.users;
	balls = data.balls;
	paddle1 = data.paddle1;
	paddle2 = data.paddle2;
}

function reply(){
	var data = {
		paddle1: paddle1,
		paddle2: paddle2,
	}
	socket.emit("reply", data);
}

function draw(){
	ctx.fillStyle="black";
	ctx.fillRect(0, 0, c.width, c.height);
	drawBalls();
	drawPaddles();
}

function mainLoop(){
	reply();
	draw();
	window.setTimeout(mainLoop, 1000/FPS);
}
