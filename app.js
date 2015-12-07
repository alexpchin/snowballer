var express = require('express');
var app     = express();

app.use(express.static(__dirname + '/public'));

var server = app.listen(8000, function() {
	var port = server.address().port;
	console.log('Server running at port %s', port);
});

var io = require('socket.io')(server);

io.on('connection', function(client) {
	console.log('User connected');
});