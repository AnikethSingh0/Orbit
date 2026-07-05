const express = require('express');
const router = express.Router();
const passport = require('passport');

const authController = require('../../controllers/auth-controller');
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { session: false }), 
    async (req, res) => {
        const token = await req.user.generateJWT();
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/?token=${token}`);
    }
);

module.exports = router;