var socket = io.connect('http://10.51.20.213:8000');

socket.on('connect', function(){
	console.log("connected")
});