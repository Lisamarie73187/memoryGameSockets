const express = require("express");
const app = express();
const server = require("http").Server(app);


const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

const createUser = (id, name) => {
    return {
        id,
        name,
        ready: false
    }
};

const addUser = (userList, user) => {
    let newList = Object.assign({}, userList)
    newList[user.name] = user
    return newList
}

let connectedUsers = [];


var userCount = 0;



io.on("connection", socket => {
    console.log('connected', userCount++);
    const user = createUser(socket.id);

    socket.on('join', (name) => {
        user.name = name
        connectedUsers.push(user);
        io.emit('users', connectedUsers);
    });

    socket.on('ready', (ready) => {
        connectedUsers.forEach((user, index) => {
            if(user.id === socket.id) {
                connectedUsers[index].ready = true;
            }
        });
        io.emit('users', connectedUsers);
    })
});

const PORT = 8080;
server.listen(PORT, () => console.log(`Listen on *: ${PORT}`));
