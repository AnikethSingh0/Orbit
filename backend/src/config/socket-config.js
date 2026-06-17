const { Server } = require("socket.io");
const chatSocketHandler = require('../sockets/chat-sockets');

let ioInstance;

const configureSockets = (server) => {
    // Set up CORS security with trimmed origin and credentials
    ioInstance = new Server(server, {
        cors: {
            origin: function(origin, callback) { callback(null, true); }, 
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    chatSocketHandler(ioInstance);

    return ioInstance;
};

module.exports = { configureSockets, getIO: () => ioInstance };