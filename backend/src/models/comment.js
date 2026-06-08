const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    parentTweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
        required: true,
    },
    onComment : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    likeCount: {
        type: Number,
        default: 0,
    },
    commentCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;