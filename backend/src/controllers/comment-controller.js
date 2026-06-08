const CommentService = require('../services/comment-service');
const commentService = new CommentService();


const createTopLevelComment = async (req, res) => {
    try {
        const comment = await commentService.createTopLevelComment({
            content: req.body.content,
            user: req.user.id,
            parentTweet: req.params.parentTweet
        });
        return res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            data: comment,
            err: {}
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating comment',
            data: {},
            err: error.message || error
        });
    }
}
const nestedReply = async (req, res) => {
    try {
        const reply = await commentService.createNestedReply({
            content: req.body.content,
            user: req.user.id,
            parentTweet: req.params.parentTweet,
            parentCommentId: req.params.parentCommentId
        });
        return res.status(201).json({
            success: true,
            message: 'Reply created successfully',
            data: reply,
            err: {}
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating reply',
            data: {},
            err: error.message || error
        });
    }
}

const getCommentsForTweet = async (req, res) => {
    try {
        const comments = await commentService.getCommentsForTweet(req.params.parentTweet);
        return res.status(200).json({
            success: true,
            message: 'Comments fetched successfully',
            data: comments,
            err: {}
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching comments for tweet',
            data: {},
            err: error.message || error
        });
    }
}

const getRepliesForComment = async (req, res) => {
    try {
        const replies = await commentService.getRepliesForComment(req.params.parentCommentId);
        return res.status(200).json({
            success: true,
            message: 'Replies fetched successfully',
            data: replies,
            err: {}
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching replies for comment',
            data: {},
            err: error.message || error
        });
    }
}

module.exports = {
    createTopLevelComment,
    nestedReply,
    getCommentsForTweet,
    getRepliesForComment
}
