const express = require('express');
const router = express.Router();
const FollowController = require('../../controllers/follow-controller.js');
const passport = require('passport');

router.post('/toggle-follow/:followingId', passport.authenticate('jwt', { session: false }), FollowController.toggleFollow);
router.get('/get-followers/:userId', passport.authenticate('jwt', { session: false }), FollowController.getFollowers);
router.get('/get-following/:userId', passport.authenticate('jwt', { session: false }), FollowController.getFollowing);
module.exports = router;