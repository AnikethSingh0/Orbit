const express = require('express');
const passport = require('passport');
const router = express.Router();
const chatController = require('../../controllers/chat-controller.js');
const upload = require('../../config/upload-config.js');

router.get('/get-history/:roomId', passport.authenticate('jwt', { session: false }), chatController.getChatHistory);
router.post('/upload', passport.authenticate('jwt', { session: false }), upload.single('file'), chatController.uploadFile);
module.exports = router;