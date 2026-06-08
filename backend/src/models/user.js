const mongoose = require('mongoose');
const { salt_round , jwt_secret } = require('../config/config.js');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
    },
    fullName: {
        type: String,
    },
    googleId: {
        type: String,
    },
    bio: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    banner: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    followersCount: {
        type: Number,
        default: 0
    },
    followingCount: {
        type: Number,
        default: 0
    },

},{ timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    try{
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, salt);
    }catch(error){
        throw error;
    }
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
            throw error;
    }
};

userSchema.methods.generateJWT = async function generateJWT() {
    const token = jwt.sign(
        { id: this._id, username: this.username },
        jwt_secret,
        { expiresIn: '7d' }
    );
    return token;
};

const User = mongoose.model('User', userSchema);
module.exports = User;