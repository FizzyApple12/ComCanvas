var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var rooms = [];
var roomEdits = [];

app.use("/assets", express.static(__dirname + '/public/assets'));
app.use("/css", express.static(__dirname + '/public/css'));
app.use("/js", express.static(__dirname + '/public/js'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function (socket) {
    console.log('User connected');

    socket.on('connectToRoom', function (msg, ack) {
        if (/^[0-9]+$/.test(msg)) {
            for (var i = 0; i < rooms.length; i++) {
                for (var j = 0; j < rooms[i].length; j++) {
                    if (rooms[i][j] != null && rooms[i][j] != undefined && rooms[i][j] == socket.id) {
                        rooms[i].splice(j, 1);
                    }
                }
            }

            if (msg != 0 && msg < 10000) {
                rooms[msg].push(socket.id);
                try { ack(true); } catch (e) { }
                io.sockets.connected[socket.id].emit("roomChange", ["pc"], roomEdits[msg]);
                console.log('User ' + socket.id + ' successfully joined room ' + msg);
            } else {
                try { ack(false); } catch (e) { }
                io.sockets.connected[socket.id].emit('FLTRERR', null);
                console.log('User ' + socket.id + ' failed to join a room');
            }
        } else {
            try { ack(false); } catch (e) { }
            io.sockets.connected[socket.id].emit('FLTRERR', null);
            console.log('User ' + socket.id + ' failed to join a room');
        }
    });

    socket.on('disconnectFromRoom', function (msg) {
        if (/^[0-9]+$/.test(msg)) {
            for (var i = 0; i < rooms.length; i++) {
                for (var j = 0; j < rooms[i].length; j++) {
                    if (rooms[i][j] != null && rooms[i][j] != undefined && rooms[i][j] == socket.id) {
                        rooms[i].splice(j, 1);
                    }
                }
            }

            console.log('User ' + socket.id + ' left room ' + msg);
        } else {
            io.sockets.connected[socket.id].emit('FLTRERR', null);
            console.log('User ' + socket.id + ' failed to leave a room');
        }
    });

    socket.on('editRoom', function (roomNum, data) {
        if (/^[0-9]+$/.test(roomNum) && roomNum != 0 && (data[0] == "line" || data[0] == "circle" || data[0] == "rectangle" || data[0] == "triangle" || data[0] == "fill")) {
            if ((data[0] == "line" && data.length == 8) || (data[0] == "circle" && data.length == 7) || (data[0] == "rectangle" && data.length == 8) || (data[0] == "triangle" && data.length == 10) || (data[0] == "fill" && data.length == 2)) {
                roomEdits[roomNum].push(data);
                for (var j = 0; j < rooms[roomNum].length; j++) {
                    if (rooms[roomNum][j] != null && rooms[roomNum][j] != undefined) {
                        io.sockets.connected[rooms[roomNum][j]].emit("roomChange", data, roomEdits[roomNum]);
                    }
                }
            } else {
                io.sockets.connected[socket.id].emit('FLTRERR', null);
            }
        } else if (!(/^[0-9]+$/.test(roomNum)) || (data[0] != "line" && data[0] != "circle" && data[0] != "rectangle" && data[0] != "triangle" && data[0] != "fill")) {
            io.sockets.connected[socket.id].emit('FLTRERR', null);
        }
    });

    socket.on('disconnect', function () {
        console.log('User disconnected');
        for (var i = 0; i < rooms.length; i++) {
            for (var j = 0; j < rooms[i].length; j++) {
                if (rooms[i][j] != null && rooms[i][j] != undefined && rooms[i][j] == socket.id) {
                    rooms[i].splice(j, 1);
                }
            }
        }
    });
});

http.listen(82, function () {
    console.log('initalizing...');

    for (var i = 0; i < 10000; i++) {
        rooms.push([]);
    }
    for (var i = 0; i < 10000; i++) {
        roomEdits.push([]);
    }

    console.log('listening on *:82');
});
