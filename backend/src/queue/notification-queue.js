const {Queue} = require('bullmq');
const redis = require('../config/redis-config.js');

const notificationQueue = new Queue('notificationQueue', {
    connection: redis,
});

module.exports = notificationQueue;