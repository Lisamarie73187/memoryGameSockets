const express = require("express");
const app = express();
const server = require("http").Server(app);

const host = {
    localHost: 'http://localhost:3000',
    hosted: 'http://memory-game-for-you.surge.sh'
};


const io = require('socket.io')(server, {
    cors: {
        origin: host.localHost,
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});


const randomHexColor = function(){
    let n = 6, s = '#';
    while(n--){
        s += (Math.random() * 16 | 0).toString(16);
    }
    return s;
};


const createUser = (userNum, id) => {
   return {
        userIndex: userNum,
        id,
        ready: false,
        turn: false,
        points: 0,
        color: randomHexColor()
    }
};


let connectedUsers = [];


const addUser = (user) => {
    connectedUsers.push(user)
};

const removeUser = (userSocketId) => {
    const userIndex = connectedUsers.findIndex(user => user.id === userSocketId)
    connectedUsers.splice(userIndex, 1)
};


const pictures = [
    'https://images.unsplash.com/photo-1497206365907-f5e630693df0?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1610109316440-2bc5ca557e9e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1134&q=80',
    'https://images.unsplash.com/photo-1604429868519-8a64cb3b010b?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1611536350692-518e9c3ab076?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1504047151359-a8de7d59dca1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1574629453731-585372252b5f?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1052&q=80',
    'https://images.unsplash.com/photo-1525382455947-f319bc05fb35?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1114&q=80',
    'https://images.unsplash.com/photo-1564731071754-001b53a902fb?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1503301360699-4f60cf292ec8?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1553558888-6440b4097908?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1495620908389-1218c605faec?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1501706362039-c06b2d715385?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1135&q=80',
    'https://images.unsplash.com/photo-1576512259505-bd5cd2a70ff8?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1595537608050-a9ef0ebc5ec6?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=2900&q=80',
    'https://images.unsplash.com/photo-1604521221077-54a0dc93612a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1148&q=80',
    'https://images.unsplash.com/photo-1559536855-364272b962c8?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1084&q=80',
    'https://images.unsplash.com/photo-1591017320663-dc3334ff1dcc?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1605337159501-cc841b9cf6e4?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1517327593670-d5c0d8ed0c37?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1101&q=80',
    'https://images.unsplash.com/photo-1562649625-f5d82689958a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1100&q=80',
    'https://images.unsplash.com/photo-1588421034962-3331763af8a0?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1145&q=80',
    'https://images.unsplash.com/photo-1582428430472-cc24166253aa?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1057&q=80'
];

const randomNumber = Math.random();


const shuffle = (array, number) => {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {

        randomIndex = Math.floor(number * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};


let whoseTurn = 0;
let userNum = 0;


io.on("connection", socket => {

    socket.on("disconnecting", (reason) => {
        removeUser(socket.id)
        io.emit('users', connectedUsers)
    });

    console.log('connected');
    const newUserNum = userNum++;
    const user = createUser(newUserNum, socket.id);


    socket.on('join', (name) => {
        user.name = name;
        addUser(user, name);
        io.emit('users', connectedUsers);
    });

    socket.on('ready', () => {
        user.ready = true;
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
                user: {}
            };
            const secondOption = {
                id: 2 * i + 1,
                pictureId: i,
                picture: pictures[i],
                flipped: false,
                user: {}
            };

            newGame.push(firstOption);
            newGame.push(secondOption);
        }

        const shuffledGame = shuffle(newGame, randomNumber);
        connectedUsers[whoseTurn].turn = true;
        io.emit('users', connectedUsers);
        io.emit('newGame', shuffledGame)
    });

    socket.on('cardFlipped', (data) => {
        io.emit('cardFlipped', data);
    });


    socket.on('nextPlayer', (indexOfUser) => {
        connectedUsers[indexOfUser].turn = true;
        if(indexOfUser > 0){
            connectedUsers[indexOfUser - 1].turn = false;
        } else {
            connectedUsers[connectedUsers.length - 1].turn = false;
        }
        io.emit('users', connectedUsers);
    });

    socket.on('addPoints', (points) => {
        for(let i = 0; i < connectedUsers.length; i++){
                connectedUsers[i].points = points[connectedUsers[i].name] ? points[connectedUsers[i].name] : 0
        }
        io.emit('users', connectedUsers);

    })

});

const PORT = 8180;
server.listen(PORT, () => console.log(`Listen on *: ${PORT}`));
