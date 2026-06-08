const express = require('express');
const passport = require('passport');
const router = express.Router();
const upload = require('../../config/upload-config');
const tweetController = require('../../controllers/tweet-controller');

router.post('/tweet',passport.authenticate('jwt'
     ,{ session: false })
     ,upload.single('media')
     ,tweetController.createTweet
    );
router.get('/tweets',tweetController.getAllTweets);
module.exports = router;