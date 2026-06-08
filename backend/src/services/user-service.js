const UserRepository = require('../repository/userRepository.js');
const TweetRepository = require('../repository/tweetRepository.js');
const CommentRepository = require('../repository/commentRepository.js');
const FollowRepository = require('../repository/followRepository.js');
class UserService {
    userRepository = new UserRepository();
    tweetRepository = new TweetRepository();
    commentRepository = new CommentRepository();
    followRepository = new FollowRepository();
    async signup(data){
        try{
            const user = await this.userRepository.create(data);
            return user;
        }catch(error){
            throw error;
        }
    }
    async getUserByEmail(email){
        try{
            const user = await this.userRepository.model.findOne({ email: email });
            return user;
        }catch(error){
            throw error;
        }
    }
    async signin(data){
        try{
            const user = await this.getUserByEmail(data.email);
            if(!user){
                throw new Error('User not found');
            }
            const isMatch = await user.comparePassword(data.password);
            if(!isMatch){
                throw new Error('Invalid password');
            }
            const token = await user.generateJWT();
            return { user, token };
        }catch(error){
            throw error;
        }
    }
    async createProfile(userId, data){
        try{
            const user = await this.userRepository.update(userId, data);
            return user;
        }catch(error){
            throw error;
        }
    }
    async getUserProfile(userId){
        try{
            const user = await this.userRepository.model.findById(userId);
            
            const [tweets, comments, followersCount, followingCount] = await Promise.all([
                this.tweetRepository.getTweetsByUserId(userId, 0, 10),
                this.commentRepository.getCommentWithUserId(userId),

            ]);

            return {user, tweets, comments };
        }catch(error){
            throw error;
        }
    }

}
module.exports = UserService;