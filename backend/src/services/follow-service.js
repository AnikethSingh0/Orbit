const FollowRepository = require('../repository/followRepository.js');
const UserRepository = require('../repository/userRepository.js');
const redis = require('../config/redis-config.js');
const notificationQueue = require('../queue/notification-queue.js');
class FollowService {
    constructor() {
        this.followRepository = new FollowRepository();
        this.userRepository = new UserRepository();
    }
    async toggleFollow(followerId, followingId) {
        try{
            //1. Check if user is trying to follow themselves
            if(followerId === followingId){
                throw new Error("You cannot follow yourself");
            }
            //2. Check if the follow record already exists
            const existingRecord = await this.followRepository.findFollowerRecord(followerId, followingId);
            if(existingRecord){
                //3. If it exists, unfollow (delete the record)
                await this.followRepository.delete(existingRecord.id);
                await this.userRepository.decrementFollowerCount(followingId);
                await this.userRepository.decrementFollowingCount(followerId);
                return { message: "Unfollowed successfully" };
            }else{
                //4. If it doesn't exist, follow (create a new record)
                await this.followRepository.create({ follower: followerId, following: followingId });
                await this.userRepository.incrementFollowerCount(followingId);
                await this.userRepository.incrementFollowingCount(followerId);
                //5. Create a notification for the user being followed
                const countKey = `notif_count:${followingId}:follow:User`;
                const scheduleKey = `notif_schedule:${followingId}:follow:User`;
                await redis.incr(countKey);
                const scheduledJob = await redis.get(scheduleKey);
                if (!scheduledJob) {
                    await notificationQueue.add('notification', {
                        recipient: followingId,
                        sender: followerId,
                        type: 'follow',
                        targetId: followerId,
                        onmodel: 'User',
                        countKey
                    }, { delay: 60000 });
                    await redis.set(scheduleKey, 'true', 'EX', 60);
                }
            }
        }catch(error){
            console.log("Error in FollowService while toggling follow:", error);
            throw error;
        }
    }

    async getFollowers(userId) {
        try {
            const followers = await this.followRepository.getFollowers(userId);
            return followers;
        }catch (error) {
            console.log("Error in FollowService while fetching followers:", error);
            throw error;
        }
    }

    async getFollowing(userId) {
        try {
            const following = await this.followRepository.getFollowing(userId);
            return following;
        }catch (error) {
            console.log("Error in FollowService while fetching following:", error);
            throw error;
        }
    }
}
module.exports = FollowService;