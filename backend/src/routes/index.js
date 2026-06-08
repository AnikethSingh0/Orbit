const express = require('express');

const router = express.Router();
const v1Api = require('./v1/tweet-routes.js');
const v1AuthRoutes = require('./v1/auth-routes.js');
const v1CommentRoutes = require('./v1/comment-routes.js');
const v1LikeRoutes = require('./v1/like-routes.js');
const v1ProfileRoutes = require('./v1/profile-routes.js');
const v1FollowRoutes = require('./v1/follow-routes.js');
const v1ChatRoutes = require('./v1/chat-routes.js');

router.use('/v1/follow', v1FollowRoutes);
router.use('/v1/profile', v1ProfileRoutes);
router.use('/v1/likes', v1LikeRoutes);
router.use('/v1/comments', v1CommentRoutes);
router.use('/v1/auth', v1AuthRoutes);
router.use('/v1/chat', v1ChatRoutes);

router.use('/v1', v1Api);
module.exports = router;