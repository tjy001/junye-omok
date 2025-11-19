const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require('path');
const rateLimit = require("express-rate-limit");

// Helper function to validate input
const isValidInput = (input, minLength = 1, maxLength = 20) => {
    if (typeof input !== 'string') {
        return false;
    }
    const trimmedInput = input.trim();
    // 1. Check Length
    if (trimmedInput.length < minLength || trimmedInput.length > maxLength) {
        return false;
    }
    // 2. Check Content (Alphanumeric only)
    // The regex /^[a-zA-Z0-9]+$/ ensures only letters and numbers are allowed.
    if (!/^[a-zA-Z0-9]+$/.test(trimmedInput)) {
        return false;
    }
    return trimmedInput; // Return the trimmed, valid string
};

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes"
});

const port = process.env.PORT || 3000;
const app = express();
app.disable('x-powered-by');
app.use(limiter);

const server = http.createServer(app);

const io = socketIo(server, { 
    cors: { 
        origin: "*", // Still fine for testing/personal project
        methods: ["GET", "POST"]
    }
});

app.use(express.static(path.join(__dirname, "..", "build")));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});
  
app.get("/", (req, res) => {
    res.send({ response: "I am alive"}).status(200);
});

app.get("*", (req, res) => {
    // Check if the request is not for a file inside the build folder
    if (!req.url.startsWith("/static")) {
         res.sendFile(path.join(__dirname, "..", "build", "index.html"));
    }
});

server.listen(port, function() {
    console.log(`Server started on port ${port}`);
});
              
let sess = [];
const lastActionMap = new Map();
const MOVE_RATE_LIMIT = 200;

io.on("connection", (socket) => {

    socket.on("hostgame", ({name, gameid}) => {
        const validatedName = isValidInput(name);
        const validatedGameId = isValidInput(gameid, 6, 6); // Game ID is 6 chars

        // Input Validation Check
        if (!validatedName || !validatedGameId) {
            socket.emit('hostfail', "Error: Invalid name or game ID format.");
            return; 
        }

        const room = io.sockets.adapter.rooms.get(validatedGameId);
        const roomSize = room ? room.size : 0;

        if (roomSize === 0) {
            // Room is available (either doesn't exist or is empty)
            socket.name = validatedName;
            sess[socket.id] = validatedGameId;
            socket.join(validatedGameId);
            socket.emit("hosted", validatedGameId);
        } else if (roomSize === 1) {
            // Room is taken by one player (shouldn't happen here, but prevents re-hosting)
            socket.emit('hostfail', "Error: Another player is already waiting with that Game ID.");
        } else {
            // Room is full (roomSize === 2)
            socket.emit('hostfail', "Error: Game ID is already in use.");
        }
    })

    socket.on("joingame", ({name, gameid}) => {
        const validatedName = isValidInput(name);
        const validatedGameId = isValidInput(gameid, 6, 6);

        // Input Validation Check
        if (!validatedName || !validatedGameId) {
            socket.emit('nogame', "Error: Invalid name or game ID format.");
            return; 
        }

        try {
            // --- NEW ROOM SIZE CHECK ---
            const room = io.sockets.adapter.rooms.get(validatedGameId);
            const roomSize = room ? room.size : 0;

            if (roomSize === 1) {
                // Room is ready for the second player
                var hostid = room.values().next().value; // The first player in the room is the host
                var host = io.of("/").sockets.get(hostid);
                
                socket.name = validatedName;
                sess[socket.id] = validatedGameId;
                socket.join(validatedGameId);
                
                socket.emit("joined", host.name);
                socket.to(validatedGameId).emit("guestjoined", socket.name);
                io.in(validatedGameId).emit("startgame");

            } else if (roomSize === 0) {
                socket.emit('nogame', "No games with this Game ID were found.");
            } else { // roomSize === 2
                socket.emit('nogame', "This game is already full.");
            }
        } catch (err) {
            // This catch block handles potential errors if room is deleted mid-request
            console.log(err);
            socket.emit('nogame', "An unexpected error occurred or the game closed.");
        }
    })

    socket.on("start", (gameid) => {
        io.in(gameid).emit("startgame");
    })

    socket.on("move", ({gameid, i, winner}) => {
        const now = Date.now();
        const lastActionTime = lastActionMap.get(socket.id) || 0;

        // Check if the time elapsed since the last move is less than the limit
        if (now - lastActionTime < MOVE_RATE_LIMIT) {
            console.log(`Rate limit exceeded for socket ${socket.id}`);
            // Optionally, disconnect the socket or send an error message
            return;
        }

        // Update the timestamp before processing the move
        lastActionMap.set(socket.id, now);

        socket.to(gameid).emit("getmove", i);
        if (winner) {
            io.in(gameid).emit("winner", winner);
        }
    })

    socket.on("draw", (gameid) => {
        io.in(gameid).emit("nowinner", "It's a Draw!");
    })
    
    socket.on("again", (gameid) => {
        socket.to(gameid).emit("invite", socket.name);
    })

    socket.on("accept", (gameid) => {
        socket.to(gameid).emit("accepted", socket.name);
        io.in(gameid).emit("startgame");
    })

    socket.on("declined", (gameid) => {
        socket.to(gameid).emit("rejected", socket.name);
    })

    socket.on('leave', (gameid) => {
        socket.to(gameid).emit("left", socket.name);
        socket.leave(gameid);
    })

    socket.on('disconnect', () => {
        // CLEANUP: Remove the socket from the map when they disconnect
        lastActionMap.delete(socket.id);

        io.in(sess[socket.id]).emit("left", socket.name);
        delete sess[socket.id];
    })
})

const router = require("./router");
app.use(router);
