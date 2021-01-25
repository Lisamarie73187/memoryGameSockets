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

let user = 0;


const createUser = (id, name) => {
    return {
        id,
        name,
        ready: false,
        userNum:  user++
    }
};

let connectedUsers = [];

const colors = [
    '#ecdb54',
    '#e34132',
    '#6ca0dc',
    '#944743',
    '#dbb2d1',
    '#ec9787',
    '#00a68c',
    '#645394',
    '#6c4f3d',
    '#ebe1df',
    '#bc6ca7',
    '#bfd833',
];

const randomNumber = 6
io.on("connection", socket => {

    socket.on("disconnecting", (reason) => {
        connectedUsers = []
    })


    console.log('connected');
    const user = createUser(socket.id);

    socket.on('join', (name) => {
        user.name = name;
        connectedUsers.push(user);
        io.emit('users', connectedUsers);
    });

    socket.on('ready', () => {
        connectedUsers.forEach((user, index) => {
            if(user.id === socket.id) {
                connectedUsers[index].ready = true;
            }
        });
        io.emit('users', connectedUsers);
    });

    socket.on('newGame', (options) => {
        const newGame = [];
        for (let i = 0; i < options / 2; i++) {
            const firstOption = {
                id: 2 * i,
                colorId: i,
                color: colors[i],
                flipped: false,
            };
            const secondOption = {
                id: 2 * i + 1,
                colorId: i,
                color: colors[i],
                flipped: false,
            };

            newGame.push(firstOption);
            newGame.push(secondOption);
        }

        const shuffledGame = newGame.sort(() => randomNumber);
        socket.emit('newGame', shuffledGame)
    })

});

const PORT = 8080;
server.listen(PORT, () => console.log(`Listen on *: ${PORT}`));
