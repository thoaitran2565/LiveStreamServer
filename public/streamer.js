

const STREAMER_PEER_ID = 'streamer';
const RECEIVER_PEER_ID = 'receiver';

const socket = io();

let streamerPeer;
let connection;

let myStream;

let idRoom;
let nameRoom;
let avatar;

connectToServer();

startScreenSharing();

// let btnStart = document.getElementById('btnStart');
// btnStart.onclick = startScreenSharing;

// let btntest = document.getElementById('btntest');
// btntest.onclick = () => {
//     socket.emit('emit-all');
// };

/**
 * Connects the streamer browser to the WebRTC server.
 */
function connectToServer() {

    let url = window.location.href;

    let queryParams = new URLSearchParams(new URL(url).search);
    let paramValue = queryParams.get('id');
    idRoom = paramValue;
    nameRoom = queryParams.get('name')
    avatar = queryParams.get('avatar')
    console.log('idRoom: ', paramValue);


    streamerPeer = new Peer(idRoom);
    streamerPeer.on('open', () => {
        socket.emit('create-room', idRoom, nameRoom, avatar);
    });

    socket.on('user-connect', (idUser) => {
        streamerPeer.call(idUser, myStream);
    });
}

/**
 * Starts a screen sharing session between the streamer and the receiver.
 */
function startScreenSharing() {
    navigator.mediaDevices.getDisplayMedia({
        video: {
            cursor: 'always'
        },
        audio: {
            echoCancellation: true,
            noiseSuppression: true
        }
    }).then(stream => {
        myStream = stream;

        const video = document.querySelector('video');
        video.srcObject = stream;
        video.style.display = 'block';


        stream.getVideoTracks()[0].onended = closeRemoteSharing;
    });
}

/**
 * Notifies the server that screen sharing is stopped.
 */
function closeRemoteSharing() {
    socket.emit('room-close', idRoom);
    streamerPeer.close();
}
