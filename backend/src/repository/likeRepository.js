const Like = require('../models/like');
const BaseRepository = require('./baseRepository');
const TweetRepository = require('./tweetRepository');
const CommentRepository = require('./commentRepository');
class LikeRepository extends BaseRepository {
    constructor() {
        super(Like);
        this.tweetRepository = new TweetRepository();
        this.commentRepository = new CommentRepository();
    }
    async findByUserAndLikeable({ user, modelId, onModel }) {
        try {
            return await this.model.findOne({
                likedBy: user,
                likeable: modelId,
                onmodel: onModel
            });
        } catch (error) {
            console.error("Error finding like:", error);
            throw error;
        }
    }
}
module.exports = LikeRepository;