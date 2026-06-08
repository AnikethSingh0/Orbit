const TweetService = require('../services/tweet-service');

const tweetService = new TweetService();
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
        const tweets = await tweetService.getAll();
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

module.exports = {
    createTweet,
    getAllTweets,
};