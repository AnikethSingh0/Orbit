const mongoose = require('mongoose');
const { mongo_uri } = require('./config');
const connectDatabase = async () => {
    const dburl = mongo_uri;
    await mongoose.connect(dburl);
}

module.exports = connectDatabase;