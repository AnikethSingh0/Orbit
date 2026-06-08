const Comment = require('../models/comment.js');
const baseRepository = require('./baseRepository.js');

class CommentRepository extends baseRepository {
    constructor() {
        super(Comment);
    }
    async incrementCommentCount(commentId) {
        try {
            const comment = await this.model.findByIdAndUpdate(
                commentId,
                { $inc: { commentCount: 1 } },
                { new: true } 
            );
            return comment;
        } catch (error) {
            console.log("Error in CommentRepository while incrementing comment count:", error);
            throw error;
        }
    }
    async decrementCommentCount(commentId) {
        try {
            const comment = await Comment.findByIdAndUpdate(
                commentId,
                { $inc: { commentCount: -1 } },
                { new: true }
            );
            return comment;
        } catch (error) {
            console.log("Error in CommentRepository while decrementing comment count:", error);
            throw error;
        }
    }
    async incrementLikeCount(commentId) {
        try {
            const comment = await Comment.findByIdAndUpdate(
                commentId,
                { $inc: { likeCount: 1 } },
                { new: true }
            );
            return comment;
        } catch (error) {
            console.log("Error in CommentRepository while incrementing like count:", error);
            throw error;
        }
    }
    async decrementLikeCount(commentId) {
        try {
            const comment = await Comment.findByIdAndUpdate(
                commentId,
                { $inc: { likeCount: -1 } },
                { new: true }
            );
            return comment;
        } catch (error) {
            console.log("Error in CommentRepository while decrementing like count:", error);
            throw error;
        }
    }
    async getCommentWithUserId(userId) {
        try {
            const comment = await this.model.find({ user : userId }).sort({ createdAt: -1 });
            return comment;
        } catch (error) {
            console.log("Error in CommentRepository while fetching comments by userId:", error);
            throw error;
        }
    }

}

module.exports = CommentRepository;