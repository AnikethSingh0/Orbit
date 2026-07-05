const { Worker } = require('bullmq');
const redis = require('../config/redis-config.js');
const FollowRepository = require('../repository/followRepository.js');

const followRepository = new FollowRepository();

const feedWorker = new Worker(
    'feedQueue',
    async (job) => {
        const { tweetId, userId } = job.data;

        // Get the followers of the user who posted the tweet
        const followers = await followRepository.getFollowers(userId);

        // Fan out the tweet to each follower's feed using a Redis pipeline
        const pipeline = redis.pipeline();

        // Add the tweet to the creator's own feed
        const authorFeedKey = `feed:${userId}`;
        pipeline.zadd(authorFeedKey, Date.now(), tweetId);
        pipeline.zremrangebyrank(authorFeedKey, 0, -501);

        followers.forEach((follower) => {
            const followerId = follower.follower._id.toString();
            const feedKey = `feed:${followerId}`;

            // Use ZADD (score, member). Date.now() used as score for ordering
            pipeline.zadd(feedKey, Date.now(), tweetId);

            // Keep only the most recent 500 items (remove older ones)
            pipeline.zremrangebyrank(feedKey, 0, -501);
        });

        await pipeline.exec();
    },
    { connection: redis }
);

module.exports = feedWorker;