const CommentRepository = require('../repository/commentRepository');
const TweetRepository = require('../repository/tweetRepository');
const redis = require('../config/redis-config.js');
const notificationQueue = require('../queue/notification-queue.js');
class CommentService{
    constructor(){
        this.commentRepository = new CommentRepository();
        this.tweetRepository = new TweetRepository();
    }
    async createTopLevelComment(data){
        try{
            const commentData = {
                content : data.content,
                user : data.user,
                parentTweet : data.parentTweet,
                onComment : null
            }

            const comment = await this.commentRepository.create(commentData);
            await this.tweetRepository.incrementCommentCount(data.parentTweet);
            
            // Create a notification for the new comment
            const tweet = await this.tweetRepository.getTweets(data.parentTweet);
            if (tweet && tweet.user.toString() !== data.user.toString()) {
                const recipientStr = tweet.user.toString();
                const countKey = `notif_count:${recipientStr}:comment:${data.parentTweet}`;
                const scheduleKey = `notif_schedule:${recipientStr}:comment:${data.parentTweet}`;
                await redis.incr(countKey);
                const scheduledJob = await redis.get(scheduleKey);
                if (!scheduledJob) {
                    await notificationQueue.add('notification', {
                        recipient: recipientStr,
                        sender: data.user,
                        type: 'comment',
                        targetId: comment.id,
                        onmodel: 'Tweet',
                        countKey
                    }, { delay: 10000 });
                    await redis.set(scheduleKey, 'true', 'EX', 10);
                }
            }

            return comment;
        }catch(error){
            console.log("Error in service layer while creating top level comment:", error);
            throw error;
        }
    }
    async createNestedReply(data){
        try{
            const replyData = {
                content : data.content,
                user : data.user,
                parentTweet : data.parentTweet,
                onComment : data.parentCommentId
            };

            const reply = await this.commentRepository.create(replyData);
            await this.tweetRepository.incrementCommentCount(data.parentTweet);
            await this.commentRepository.incrementCommentCount(data.parentCommentId);

            // Create a notification for the new reply
            const parentComment = await this.commentRepository.model.findById(data.parentCommentId);
            if (parentComment && parentComment.user.toString() !== data.user.toString()) {
                const recipientStr = parentComment.user.toString();
                const countKey = `notif_count:${recipientStr}:comment:${data.parentCommentId}`;
                const scheduleKey = `notif_schedule:${recipientStr}:comment:${data.parentCommentId}`;
                await redis.incr(countKey);
                const scheduledJob = await redis.get(scheduleKey);
                if (!scheduledJob) {
                    await notificationQueue.add('notification', {
                        recipient: recipientStr,
                        sender: data.user,
                        type: 'comment',
                        targetId: reply.id,
                        onmodel: 'Comment',
                        countKey
                    }, { delay: 60000 });
                    await redis.set(scheduleKey, 'true', 'EX', 60);
                }
            }

            return reply;
        }catch(error){
            console.log("Error in service layer while creating nested reply:", error);
            throw error;
        }
    }
    async getCommentsForTweet(tweetId){
        try{
            const comments = await this.commentRepository.model.find({ parentTweet: tweetId, onComment: null })
            .populate('user', 'name username')
            .sort({ createdAt: -1 });

            return comments;
        }catch(error){
            console.log("Error in service layer while fetching comments for tweet:", error);
            throw error;
        }
    }

    async getRepliesForComment(commentId){
        try{
            const replies = await this.commentRepository.model.find({ onComment: commentId })
            .populate('user', 'name username')
            .sort({ createdAt: -1 });

            return replies;
        }catch(error){
            console.log("Error in service layer while fetching replies for comment:", error);
            throw error;
        }
    }

    async deleteComment(commentId, userId){
        try{
            const comment = await this.commentRepository.model.findById(commentId);
            if(!comment){
                throw new Error("Comment not found");
            }
            if(comment.user.toString() !== userId){
                throw new Error("Unauthorized to delete this comment");
            }
            if(comment.onComment){
                
            }
        }catch(error){
            console.log("Error in service layer while deleting comment:", error);
            throw error;
        }
    }
}
module.exports = CommentService;