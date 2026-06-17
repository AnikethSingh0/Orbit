const TweetService = require('../services/tweet-service');

const tweetService = new TweetService();
const trendingHashtags = async (req, res) => {
    try {
        const hashtags = await tweetService.getTrendingHashtags();
        return res.status(200).json({
            data : hashtags,
            status : 'success',
            message: 'Trending hashtags fetched successfully',
            error : {},
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error fetching trending hashtags',
            error: error.message
        });
    }
};
const createTweet = async (req, res) => {
    try {
        const data = req.body;
        data.user = req.user.id;

        if(req.file){
            data.mediaUrl = req.file.path;
        }

        const tweet = await tweetService.create(data);
        return res.status(201).json({
            data : tweet,
            status : 'success',
            message: 'Tweet created successfully',
            error : {},
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error creating tweet',
            error: error.message
        });
    }
};
const getAllTweets = async (req, res) => {
    try {
        const { offset = 0, limit = 10 } = req.query;
        const tweets = await tweetService.getAll(parseInt(offset, 10), parseInt(limit, 10));
        return res.status(200).json({
            data : tweets,
            status : 'success',
            message: 'Tweets fetched successfully',
            error : {},
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error fetching tweets',
            error: error.message
        });
    }
};

const getHomeFeed = async (req, res) => {
    try {
        const userId = req.user.id;
        const { cursor, limit } = req.params;
        const actualCursor = cursor === 'null' ? null : cursor;
        const tweets = await tweetService.getHomeFeed(userId, actualCursor, parseInt(limit, 10));
        let lastTweet = null;
        if(tweets.length > 0){
            lastTweet = tweets[tweets.length - 1].id;
        }
        return res.status(200).json({
            data : tweets,
            status : 'success',
            message: 'Home feed fetched successfully',
            error : {},
            nextCursor: lastTweet,
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error fetching home feed',
            
            error: error.message
        });
    }
};

module.exports = {
    createTweet,
    getAllTweets,
    trendingHashtags,
    getHomeFeed,
};