const User = require('../models/user.js');
const baseRepository = require('./baseRepository.js');
class UserRepository extends baseRepository {
    constructor() {
        super(User);
    }
    async incrementFollowerCount(userId) {
        try {
            const user = await this.model.findByIdAndUpdate(
                userId,
                { $inc: { followersCount: 1 } },
                { returnDocument: 'after' }
            );
            return user;
        } catch (error) {
            console.log("Error in UserRepository while incrementing follower count:", error);
            throw error;
        }
    }
    async decrementFollowerCount(userId) {
        try {
            const user = await this.model.findByIdAndUpdate(
                userId,
                { $inc: { followersCount: -1 } },
                { returnDocument: 'after' }
            );
            return user;
        } catch (error) {
            console.log("Error in UserRepository while decrementing follower count:", error);
            throw error;
        }
    }
    async incrementFollowingCount(userId) {
        try {
            const user = await this.model.findByIdAndUpdate(
                userId,
                { $inc: { followingCount: 1 } },
                { returnDocument: 'after' }
            );
            return user;
        } catch (error) {
            console.log("Error in UserRepository while incrementing following count:", error);
            throw error;
        }
    }
    async decrementFollowingCount(userId) {
        try {
            const user = await this.model.findByIdAndUpdate(
                userId,
                { $inc: { followingCount: -1 } },
                { returnDocument: 'after' }
            );
            return user;
        } catch (error) {
            console.log("Error in UserRepository while decrementing following count:", error);
            throw error;
        }
    }
}
module.exports = UserRepository;
