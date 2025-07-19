
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = [];

app.use(express.static('public'));

io.on('connection', (socket) => {
    if (users.length >= 2) {
        socket.emit('roomFull');
        socket.disconnect();
        return;
    }

    socket.on('setUsername', (username) => {
        socket.username = username;
        users.push(username);
        socket.broadcast.emit('userJoined', username);

        socket.on('chatMessage', (msg) => {
            io.emit('chatMessage', { user: socket.username, text: msg });
        });

        socket.on('disconnect', () => {
            users = users.filter(u => u !== socket.username);
            socket.broadcast.emit('userLeft', socket.username);
        });
    });
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
