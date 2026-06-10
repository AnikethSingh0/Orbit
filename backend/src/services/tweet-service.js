const {TweetRepository , HashtagRepository} = require('../repository/index');
const redis = require('../config/redis-config');
class TweetService {
    constructor() {
        this.tweetRepository = new TweetRepository();
        this.hashtagRepository = new HashtagRepository();
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
        }
    }
    async create(data){
        const tweet = await this.tweetRepository.createTweet(data);
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
            this.updateTrendingHashtags(uniqueTags).catch((error) => {
                console.error('Error updating trending hashtags: ' + error.message);
            });
        }

        return tweet; 
    }
    async getAll(){
        try{
            const tweets = await this.tweetRepository.getAllTweets(0,10);
 
            return tweets;
        }catch(error){
            throw new Error('Error fetching tweets: ' + error.message);
        }
        
    }
}
module.exports = TweetService;