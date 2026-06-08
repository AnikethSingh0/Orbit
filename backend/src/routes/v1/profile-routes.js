const express = require('express');
const router = express.Router();
const passport = require('passport');
const { createProfile,getProfile } = require('../../controllers/user-controllers.js');
const upload = require('../../config/upload-config.js');

router.get('/fetch-profile/:id', passport.authenticate('jwt', { session: false }),getProfile);
router.patch('/update-profile', passport.authenticate('jwt', { session: false }), upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), createProfile);
module.exports = router;