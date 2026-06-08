const hashtag = require('../models/hashtag');
class hashtagRepository{
    async createHashtag(data){
        try {
            const newHashtag = new hashtag(data);
            return await newHashtag.save();
        } catch (error) {
            throw error;
        }
    }
    async bulkCreate(tags, tweetId){
        try{
            const store = tags.map((tag) => {
                return {
                    updateOne:{
                        filter : { tag : tag },
                        update : { $addToSet : { tweets : tweetId }},
                        upsert : true
                    }
                }
            })
            return await hashtag.bulkWrite(store);
        }catch(error){
            throw error;
        }
    }
}
module.exports = hashtagRepository;