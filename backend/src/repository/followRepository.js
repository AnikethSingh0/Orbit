const Follow = require('../models/follow.js');
const baseRepository = require('./baseRepository.js');

class FollowRepository extends baseRepository {
    constructor() {
        super(Follow);
     }

    async findFollowerRecord(followerId, followingId) {
        try {
            const record = await this.model.findOne({ 
                follower: followerId,
                following: followingId
            });
            return record;
        }
        catch (error) {
            console.log("Error in FollowRepository while finding follower record:", error);
            throw error;
        }
    }

    async getFollowers(userId) {
        try {
            const followers = await this.model.find({ following: userId }).populate('follower', 'username fullName avatar');
            return followers;
        } catch (error) {
            console.log("Error in FollowRepository while fetching followers:", error);
            throw error;
        }
    }

    async getFollowing(userId) {
        try {
            const following = await this.model.find({ follower: userId }).populate('following', 'username fullName avatar');
            return following;
        } catch (error) {
            console.log("Error in FollowRepository while fetching following:", error);
            throw error;
        }
    }
}

module.exports = FollowRepository;