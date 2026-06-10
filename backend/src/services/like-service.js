const LikeRepository = require('../repository/likeRepository');
const TweetRepository = require('../repository/tweetRepository');
const CommentRepository = require('../repository/commentRepository');
const redis = require('../config/redis-config.js');
const notificationQueue = require('../queue/notification-queue.js');
class LikeService {
    constructor(){
        this.likeRepository = new LikeRepository();
        this.tweetRepository = new TweetRepository();
        this.commentRepository = new CommentRepository();
    }
    async toggleLike(userId, modelId, modelType){
        try {
            const existingLike = await this.likeRepository.findByUserAndLikeable({
                user : userId, 
                modelId : modelId, 
                onModel : modelType 
            });
            if(existingLike){
                await this.likeRepository.delete(existingLike.id);
                if(modelType === 'Tweet'){
                    await this.tweetRepository.decrementLikeCount(modelId);
                }else if(modelType === 'Comment'){
                    await this.commentRepository.decrementLikeCount(modelId);
                }
            }else{
                await this.likeRepository.create({
                    likedBy: userId,
                    likeable: modelId,
                    onmodel: modelType
                });
                if(modelType === 'Tweet'){
                    await this.tweetRepository.incrementLikeCount(modelId);
                }else if(modelType === 'Comment'){
                    await this.commentRepository.incrementLikeCount(modelId);
                }
                // Create a notification for the like
                let recipientId = null;
                if(modelType === 'Tweet'){
                    const tweet = await this.tweetRepository.getTweets(modelId);
                    if (tweet) recipientId = tweet.user;
                } else if(modelType === 'Comment'){
                    const comment = await this.commentRepository.model.findById(modelId);
                    if (comment) recipientId = comment.user;
                }
                
                if (recipientId && recipientId.toString() !== userId.toString()) {
                    const recipientStr = recipientId.toString();
                    const countKey = `notif_count:${recipientStr}:like:${modelId}`;
                    const scheduleKey = `notif_schedule:${recipientStr}:like:${modelId}`;
                    await redis.incr(countKey);
                    const scheduledJob = await redis.get(scheduleKey);
                    if (!scheduledJob) {
                        await notificationQueue.add('notification', {
                            recipient: recipientStr,
                            sender: userId,
                            type: 'like',
                            targetId: modelId,
                            onmodel: modelType,
                            countKey
                        }, { delay: 10000 });
                        await redis.set(scheduleKey, 'true', 'EX', 10);
                    }
                }
            }

        }catch(error){
            console.log("Error in service layer while toggling like:", error);
            throw error;
        }
    }
}
module.exports = LikeService;