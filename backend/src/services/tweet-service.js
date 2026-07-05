const {TweetRepository , HashtagRepository, FollowRepository} = require('../repository/index');
const FeedQueue = require('../queue/feed-queue');
const redis = require('../config/redis-config');
class TweetService {
    constructor() {
        this.tweetRepository = new TweetRepository();
        this.hashtagRepository = new HashtagRepository();
        this.followRepository = new FollowRepository();
    }
    async getTrendingHashtags() {
        try{
            const trendingKey = 'trending_hashtags';
            const topTags = await redis.zrevrange(trendingKey, 0, 9, 'WITHSCORES');
            const trendingHashtags = [];
            for(let i = 0; i < topTags.length; i += 2){
                trendingHashtags.push({
                    tag: topTags[i],
                    score: parseInt(topTags[i + 1])
                });
            }
            return trendingHashtags;
        }catch(error){
            throw new Error('Error fetching trending hashtags: ' + error.message);
        }
    }
    async updateTrendingHashtags(tags) {
        try{
            const trendingKey = 'trending_hashtags';
            const pipeline = redis.pipeline();
            tags.forEach((tag) => {
                pipeline.zincrby(trendingKey, 1, tag);
            });
            await pipeline.exec();
        }catch(error){
            throw new Error('Error updating trending hashtags: ' + error.message);
        }
    }
    async create(data){
        const tweet = await this.tweetRepository.createTweet(data);

        //put tweet id and user id in the queue
        await FeedQueue.add('fanout-tweet', {
            tweetId: tweet._id,
            userId: tweet.userId
        });

        /*
             - first we will validate the data
             - then we will extract the hashtags from the content and save them in the database
             - using regex to validate the hashtags
        */
        const content = data.content || "";
        let tags = content.match(/#\w+/g) || [];

        /* 
            - bulk create the hashtags in the database
            - create only those hashtag which are not already present in the database
            - add tweet id to the hashtag document
         */

        if(tags.length > 0){
            // Removing the '#' from the tags
            tags = tags.map((tag) => {
                return tag.substring(1);
            });

            // unique tags
            const uniqueTags = [...new Set(tags)];
            await this.hashtagRepository.bulkCreate(uniqueTags, tweet._id);
            await this.updateTrendingHashtags(uniqueTags).catch((error) => {
                console.error('Error updating trending hashtags: ' + error.message);
            });
        }

        return tweet; 
    }
    async getAll(offset = 0, limit = 10){
        try{
            const tweets = await this.tweetRepository.getAllTweets(offset, limit);
 
            return tweets;
        }catch(error){
            throw new Error('Error fetching tweets: ' + error.message);
        }
        
    }
    async getHomeFeed(userId,cursor,limit){
        try{
            const feedKey = `feed:${userId}`;
            const zsetsize = await redis.zcard(feedKey);

            if(zsetsize > 0){
                //we have tweets in the feed, we will fetch them from the zset
                let start = 0;
                if(cursor){
                    //if cursor is present, we will fetch the tweets from the zset using the cursor
                    const rank = await redis.zrevrank(feedKey, cursor);
                    if(rank !== null){
                        start = rank + 1;
                    }
                }
                const tweetIds = await redis.zrevrange(feedKey, start, start + limit - 1);
                return await this.tweetRepository.getTweetsByIds(tweetIds);
            }else{
                const tweets = await this.tweetRepository.getfeed(cursor, limit);
                return tweets;
            }
            
        }catch(error){
            throw new Error('Error fetching home feed: ' + error.message);
        }
    }
}
module.exports = TweetService;