const mongoose = require('mongoose');
const { mongo_uri } = require('./config');
const connectDatabase = async () => {
    await mongoose.connect(mongo_uri);
}

module.exports = connectDatabase;