const mongoose = require('mongoose');
const { mongo_uri } = require('./config');
const connectDatabase = async () => {
    const dburl = mongo_uri || 'mongodb://localhost:27017/twitter_dev';
    await mongoose.connect(dburl);
}

module.exports = connectDatabase;