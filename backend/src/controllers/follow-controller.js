const FollowService = require('../services/follow-service.js');

const followService = new FollowService();

const toggleFollow = async (req, res) => {
    try {
        await followService.toggleFollow(req.user.id, req.params.followingId);
        return res.status(200).json({
            status: 'success',
            data: null,
            message: 'Follow toggled successfully',
            error: null
        });
    }catch (error) {
        console.log("Error in controller layer while toggling follow:", error);
        return res.status(500).json({
            status: 'error',
            data: null,
            message: 'An error occurred while toggling follow',
            error: error.message
        });
    }
}

const getFollowers = async (req, res) => {
    try {
        const followers = await followService.getFollowers(req.params.userId);
        return res.status(200).json({
            status: 'success',
            data: followers,
            message: 'Followers fetched successfully',
            error: null
        });
    }catch (error) {
        console.log("Error in controller layer while fetching followers:", error);
        return res.status(500).json({
            status: 'error',
            data: null,
            message: 'An error occurred while fetching followers',
            error: error.message
        });
    }
}
 
const getFollowing = async (req, res) => {
    try {
        const following = await followService.getFollowing(req.params.userId);
        return res.status(200).json({
            status: 'success',
            data: following,
            message: 'Following fetched successfully',
            error: null
        });
    }catch (error) {
        console.log("Error in controller layer while fetching following:", error);
        return res.status(500).json({
            status: 'error',
            data: null,
            message: 'An error occurred while fetching following',
            error: error.message
        });
    }
}

module.exports = {
    toggleFollow,
    getFollowers,
    getFollowing
}
