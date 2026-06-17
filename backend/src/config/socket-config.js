const { Server } = require("socket.io");
const chatSocketHandler = require('../sockets/chat-sockets');

let ioInstance;

const configureSockets = (server) => {
    // Set up CORS security
    ioInstance = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173", 
            methods: ["GET", "POST"]
        }
    });

    chatSocketHandler(ioInstance);

    return ioInstance;
};

module.exports = { configureSockets, getIO: () => ioInstance };