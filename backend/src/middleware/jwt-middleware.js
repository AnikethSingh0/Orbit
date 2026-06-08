const JWT = require('passport-jwt');
const User = require('../models/user');
const { jwt_secret } = require('../config/config');

const JwtStrategy = JWT.Strategy;
const ExtractJwt = JWT.ExtractJwt;

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwt_secret
};

const passportAuth = (passport) => {
    passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            const user = await User.findById(jwt_payload.id);
            if (!user) {
                return done(null, false);
            } else {
                return done(null, user);
            }
        } catch (error) {
            console.error("Error in JWT middleware:", error);
            return done(error, false);
        }
    }));
};

module.exports = passportAuth;