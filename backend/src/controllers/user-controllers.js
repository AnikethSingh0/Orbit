const UserService = require('../services/user-service.js');

const userService = new UserService();

const createProfile = async (req, res) => {
    try {
        const data = {
            bio: req.body.bio,
            username: req.body.username,
            fullName: req.body.fullName,
            location: req.body.location,
        };

        if (req.files?.avatar?.[0]) {
            data.avatar = req.files.avatar[0].path;
        }
        if (req.files?.banner?.[0]) {
            data.banner = req.files.banner[0].path;
        }

        const profile = await userService.createProfile(req.user.id, data);
        return res.status(200).json({
            data: profile,
            status: 'success',
            message: 'Profile updated successfully',
            error: {},
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error creating profile',
            error: error.message,
        });
    }
};
async function getProfile(req, res) {
    try {
        const profile = await userService.getUserProfile(req.params.id);
        return res.status(200).json({
            data: profile,
            status: 'success',
            message: 'Profile fetched successfully',
            error: {},
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error fetching profile',
            error: error.message,
        });
    }
}

module.exports = {
    createProfile,
    getProfile
};