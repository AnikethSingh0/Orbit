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
        res.redirect(`http://localhost:5173/?token=${token}`);
        res.status(200).json({
            success: true,
            message: 'Successfully logged in with Google',
            data: token
        });
    }
);

module.exports = router;