var express = require("express");

var app = express();
let port = 3000 || process.env.PORT;
var server = app.listen(port);
var users = [];

app.use(express.static("html"));

var socket = require("socket.io");

var io = socket(server);

io.sockets.on("connection", newConnection);

function newConnection(socket){
	users.push(socket.id);
	var data = socket.id;
	socket.emit("id", data);
	if(users.length === 1){
		paddle1.points = 0
		paddle2.points = 0;
	}
	if(users.length === 2){
		paddle1.points = 0;
		paddle2.points = 0;
		addBall();
	}
	socket.on("reply", takeReply);
	socket.on("disconnect", disconnect);
}

function disconnect(socket){
	var i = users.indexOf(socket.id)
	balls.splice(i, 1);
	users.splice(i, 1);
}

var FPS = 30;
var c = {
	width: 1000,
	height: 600,
}

var paddle1 = {
	pos: {x: undefined, y: undefined},
	size: {x: 20, y: 100},
	points: 0,
}

var paddle2 = {
	pos: {x: undefined, y: undefined},
	size: {x: -20, y: 100},
	points: 0,
}

var balls = [];

function addBall(){
	var b = new Ball();
	b.pos.x = c.width/2;
	b.pos.y = c.height/2; 
	b.speed.y = 7;
	b.speed.x = 3;
	b.id = socket.id;
	balls.push(b);
}

function Ball(){
	this.pos = {x: 0, y: 0,};
	this.speed = {x: 0, y: 0};
	this.size = 20;
	this.id;
}

balls.update = function(){
	balls.forEach(function(ball){
		ball.pos.x += ball.speed.x;
		ball.pos.y += ball.speed.y;
		if(ball.pos.x > c.width){
			ball.pos.x = c.width/2;
			ball.pos.y = c.height/2;
			ball.speed.x = 3;
			ball.speed.x *= -1;
			paddle1.points ++;
			if((paddle1.points + paddle2.points) % 10 === 0){
				addBall();
			}
		}
		if(ball.pos.x < -20){
			ball.pos.x = c.width/2;
			ball.pos.y = c.width/2;
			ball.speed.x = 3;
			ball.speed.x *= -1;
			paddle2.points ++;
			if((paddle1.points + paddle2.points) % 10 === 0){
				addBall();
			}
		}
		if(ball.pos.y + ball.size> c.height){
			ball.speed.y *= -1;
		}
		if(ball.pos.y < 0){
			ball.speed.y *= -1;
		}
	});
}

function updatePaddles(){
	balls.forEach(function(ball){
		if(ball.pos.y + ball.size > paddle1.pos.y && ball.pos.y < paddle1.pos.y + paddle1.size.y
		&& ball.pos.x < paddle1.pos.x + paddle1.size.x){
			ball.speed.x --;
			ball.speed.x *= -1;
		}
		if(ball.pos.y + ball.size > paddle2.pos.y && ball.pos.y < paddle2.pos.y + paddle2.size.y
		&& ball.pos.x + ball.size > paddle2.pos.x + paddle2.size.x){
			ball.speed.x ++;
			ball.speed.x *= -1;
		}
	});
}

function takeReply(data){
	paddle1 = data.paddle1;
	paddle2 = data.paddle2;
}

function updateLoop(){
	updatePaddles();
	balls.update();
	var data = {
		users: users,
		balls: balls,
		paddle1: paddle1,
		paddle2: paddle2,
	};
	io.sockets.emit("update", data);
	setTimeout(updateLoop, 1000/FPS);
}
updateLoop();
