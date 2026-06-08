const LikeService = require('../services/like-service');
const likeService = new LikeService();


const toggleLike = async (req, res) => {
    try {
        await likeService.toggleLike(req.user.id, req.params.modelId, req.params.modelType);
        return res.status(200).json({
            status: 'success',
            data: null,
            message: 'Like toggled successfully',
            error: null
        });
    } catch (error) {        
        console.log("Error in controller layer while toggling like:", error);
        return res.status(500).json({
            status: 'error',
            data: null,
            message: 'An error occurred while toggling like',
            error: error.message
        });
    }       
}
module.exports = {
    toggleLike
}