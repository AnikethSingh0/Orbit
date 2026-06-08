const moongoose = require('mongoose');

const hashtagSchema = new moongoose.Schema({
    tag: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
    },
    tweets: [
        {
            type: moongoose.Schema.Types.ObjectId,
            ref: 'Tweet',
        }
    ]
} , { timestamps: true });

const Hashtag = moongoose.model('Hashtag', hashtagSchema);
module.exports = Hashtag;