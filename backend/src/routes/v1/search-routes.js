const express = require('express');
const passport = require('passport');
const router = express.Router();
const searchController = require('../../controllers/search-controller');

router.get('/users', passport.authenticate('jwt', { session: false }), searchController.searchUsers);

module.exports = router;