const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT;
const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {cors: {origin: "*"}}); 

server.listen(port, "0.0.0.0", function() {
    console.log('Server started on port ' + port);
}
              
let sess = [];

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('build'));
    app.get('*', (req, res) => {
      res.sendFile(path.join('build', 'index.html'));
    });
  }

io.on("connection", (socket) => {

    socket.on("hostgame", ({name, gameid}) => {
        if (!socket.adapter.rooms.has(gameid)) {
            socket.name = name;
            sess[socket.id] = gameid;
            socket.join(gameid);
            socket.emit("hosted", gameid);
        } else {
            socket.emit('hostfail', "Error: Another game with that Game ID already exists");
        }
    })

    socket.on("joingame", ({name, gameid}) => {
        try {
            if (io.sockets.adapter.rooms.has(gameid) && io.sockets.adapter.rooms.get(gameid).size < 2) {
                var inroom = io.sockets.adapter.rooms.get(gameid);
                var hostid = inroom.values().next().value;
                var host = io.of("/").sockets.get(hostid);
                socket.name = name;
                sess[socket.id] = gameid;
                socket.join(gameid);
                socket.emit("joined", host.name);
                socket.to(gameid).emit("guestjoined", socket.name);
                io.in(gameid).emit("startgame");
            } else {
                socket.emit('nogame', "No games with this Game ID were found");
            }
        } catch (err) {
            console.log(err);
            socket.emit('nogame', "No games with this Game ID were found");
        }
    })

    socket.on("start", (gameid) => {
        io.in(gameid).emit("startgame");
    })

    socket.on("move", ({gameid, i, winner}) => {
        socket.to(gameid).emit("getmove", i);
        if (winner) {
            io.in(gameid).emit("winner", winner);
        }
    })

    socket.on("draw", (gameid) => {
        io.in(gameid).emit("nowinner", "It's a Draw!");
    })

    socket.on('leave', (gameid) => {
        socket.to(gameid).emit("left", socket.name);
        socket.leave(gameid);
    })

    socket.on('disconnect', () => {
        io.in(sess[socket.id]).emit("left", socket.name);
        delete sess[socket.id];
    })
})

app.use(router);
