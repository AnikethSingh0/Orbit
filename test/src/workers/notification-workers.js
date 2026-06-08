const {Worker} = require('bullmq');
const notificationQueue = require('../queue/notification-queue.js');
const redis = require('../config/redis-config.js');
const Notification = require('../models/notification.js');
const { getIO } = require('../config/socket-config.js');
const notificationWorker = new Worker('notificationQueue', async job => {
    const {recipient, sender, type, targetId, onmodel, countKey} = job.data;

    let batchedCount = 1;
    if (countKey) {
        const redisCount = await redis.get(countKey);
        if (redisCount) {
            batchedCount = parseInt(redisCount, 10);
        }
        await redis.del(countKey);
        const scheduleKey = countKey.replace('notif_count:', 'notif_schedule:');
        await redis.del(scheduleKey);
    }

    const notification = await Notification.create({
        recipient,
        sender,
        type,
        targetId,
        onmodel,
        count: batchedCount
    });

    const io = getIO();
    if(io){
        let messageStr = `You have a new ${notification.type} notification`;
        if (batchedCount > 1) {
            if (notification.type === 'like') {
                messageStr = `You have ${batchedCount} new likes`;
            } else if (notification.type === 'follow') {
                messageStr = `You have ${batchedCount} new followers`;
            } else if (notification.type === 'comment') {
                messageStr = `You have ${batchedCount} new comments`;
            }
        }
        io.to(recipient.toString()).emit('newNotification', {
            notification: notification,
            message: messageStr
        });
    }
}, {
    connection: redis,
    concurrency: 5
});


