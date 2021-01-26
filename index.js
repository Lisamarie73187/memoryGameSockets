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
        userNum:  user++,
        turn: false
    }
};

let connectedUsers = [];

const pictures = [
    'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=976&q=80',
    'https://images.unsplash.com/photo-1497206365907-f5e630693df0?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1525382455947-f319bc05fb35?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1114&q=80',
    'https://images.unsplash.com/photo-1475372674317-8003c861cb6a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80',
    'https://images.unsplash.com/photo-1527161153332-99adcc6f2966?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1649&q=80',
    'https://images.unsplash.com/photo-1553558888-6440b4097908?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1576512259505-bd5cd2a70ff8?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1604521221077-54a0dc93612a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1148&q=80',
    'https://images.unsplash.com/photo-1605337159501-cc841b9cf6e4?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1562649625-f5d82689958a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1610109316440-2bc5ca557e9e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1134&q=80',
    'https://images.unsplash.com/photo-1588421034962-3331763af8a0?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1145&q=80',
    'https://images.unsplash.com/photo-1560659245-ea431e0154a9?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1550853024-fae8cd4be47f?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1107&q=80'
];

const randomNumber = .35234523453;

let playerGoesFirst = 0;


const shuffle = (array, number) => {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(number * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


io.on("connection", socket => {

    socket.on("disconnecting", (reason) => {
        connectedUsers = []
    });

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
                pictureId: i,
                picture: pictures[i],
                flipped: false,
            };
            const secondOption = {
                id: 2 * i + 1,
                pictureId: i,
                picture: pictures[i],
                flipped: false,
            };

            newGame.push(firstOption);
            newGame.push(secondOption);
        }

        const shuffledGame = shuffle(newGame, randomNumber);
        connectedUsers.forEach((user, index) => {
            if(user.id === connectedUsers[0].id) {
                connectedUsers[index].turn = true;
            }
        });
        io.emit('users', connectedUsers);
        io.emit('newGame', shuffledGame)
    });

    socket.on('cardFlipped', (data) => {
        io.emit('cardFlipped', data);
    });


    socket.on('nextPlayer', (indexOfUser) => {
        connectedUsers[indexOfUser].turn = true;
        if(indexOfUser > 0){
            connectedUsers[indexOfUser -1].turn = false;
        } else {
            connectedUsers[connectedUsers.length - 1].turn = false;
        }
        io.emit('users', connectedUsers);
    })

});

const PORT = 8080;
server.listen(PORT, () => console.log(`Listen on *: ${PORT}`));
