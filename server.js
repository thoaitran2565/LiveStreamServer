/*
 * Copyright 2000-2022 TeamDev.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import express from 'express';
import http from 'http';
import { Server as SocketIO } from "socket.io";
import * as url from 'url';
import { job } from './cron.config.js'

job.start();

const app = express();
const httpServer = http.createServer(app);
const io = new SocketIO(httpServer);
const room = 'room';
const rootPath = url.fileURLToPath(new URL('.', import.meta.url));

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.json({ message: 'Hello, World!' });
});

app.get('/streamer', (req, res) => {
    res.sendFile(rootPath + 'public/streamer.html');
});
app.get('/receiver', (req, res) => {
    res.sendFile(rootPath + 'public/receiver.html');
});

app.get('/receiver2', (req, res) => {
    res.sendFile(rootPath + 'public/receiver2.html');
});

app.get('/api/get-list-room', (req, res) => {
    console.log('listRoom: ', listRoom);
    res.json({
        errCode: 0,
        data: listRoom
    });
});


let listRoom = [];


io.on('connection', (socket) => {
    socket.on('create-room', (idRoom, nameRoom, avatar) => {
        console.log('create-room');
        listRoom.push({ idRoom, nameRoom, avatar });
        socket.join(idRoom);
        socket.on('disconnect', () => {
            console.log('room close: exit');
            socket.leave(idRoom);
            socket.to(idRoom).emit('room-close', idRoom);

            listRoom = listRoom.filter((room) => room.idRoom !== idRoom);
        });
    });

    socket.on('connect-room', (idRoom, idUser) => {
        socket.join(idRoom);

        socket.to(idRoom).emit('user-connect', idUser);

        socket.on('disconnect', () => {
            // socket.to(idRoom).emit('user-disconnected');
            console.log('user disconnect room');
        });

    });

    socket.on('room-close', (idRoom) => {
        console.log('room close: stop-share');
        socket.to(idRoom).emit('room-close', idRoom);

        listRoom = listRoom.filter((room) => room.idRoom !== idRoom);

    });
});

httpServer.listen(3030, () => {
    console.log('Server is running on port 3030');

});
