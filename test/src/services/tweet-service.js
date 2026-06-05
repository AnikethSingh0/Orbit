const {TweetRepository , HashtagRepository} = require('../repository/index');
class TweetService {
    constructor() {
        this.tweetRepository = new TweetRepository();
        this.hashtagRepository = new HashtagRepository();
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