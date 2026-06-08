const express = require('express');
const connect = require('./config/database');
const routes = require('./routes/index');
const passport = require('passport');
const passportAuth = require('./middleware/jwt-middleware');
const passportGoogleAuth = require('./middleware/google-middleware');
const { configureSockets } = require('./config/socket-config');
require('./workers/notification-workers');
require('./queue/notification-queue');
const redis = require('./config/redis-config.js');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
configureSockets(server);

app.use(cors());
app.use(passport.initialize());
passportAuth(passport);
passportGoogleAuth(passport);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', routes);


const run = () => {
    server.listen(3000, async () => {
        console.log('Server is running on port 3000');
        await connect();
        console.log('Database connected successfully');
    });
}; 

run();