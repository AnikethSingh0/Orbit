const {Queue} = require('bullmq');
const redis = require('../config/redis-config.js');

const feedQueue = new Queue('feedQueue', {
    connection: redis,
});

module.exports = feedQueue;