const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    salt_round : process.env.SALT_ROUND,
    jwt_secret : process.env.JWT_SECRET,
    client_id : process.env.CLIENT_ID,
    client_secret : process.env.CLIENT_SECRET,
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    cloud_api_key : process.env.CLOUDINARY_API_KEY,
    cloud_api_secret : process.env.CLOUDINARY_API_SECRET,
    mongo_uri : process.env.MONGO_URI,
}