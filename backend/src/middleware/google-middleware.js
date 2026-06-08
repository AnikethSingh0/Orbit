const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.js');
const { client_id, client_secret } = require('../config/config.js');

const passportGoogleAuth = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: client_id,
        clientSecret: client_secret,
        callbackURL: "http://localhost:3000/api/v1/auth/google/callback"
      },
      async function(accessToken, refreshToken, profile, done) {
        try {
            let user = await User.findOne({ email: profile.emails[0].value });
            
            if (user) {
                if (!user.googleId) {
                    user.googleId = profile.id;
                    await user.save();
                }
                return done(null, user);
            }
    
            const newUser = await User.create({
                email: profile.emails[0].value,
                fullName: profile.displayName,
                username: profile.emails[0].value.split('@')[0],
                googleId: profile.id
            });
            return done(null, newUser);
        } catch(error) {
            return done(error, false);
        }
      }
    ));
};

// Export the function so index.js can use it
module.exports = passportGoogleAuth;