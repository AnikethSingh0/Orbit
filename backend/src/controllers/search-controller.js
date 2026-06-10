const UserService = require('../services/user-service');
const userService = new UserService();

const searchUsers = async (req, res) => {
    try {
        const query = req.query.query;
        const users = await userService.searchUsers(query);
        return res.status(200).json({
            data: users,
            status: 'success',
            message: 'Users fetched successfully',
            error: {},
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error fetching users',
            error: error.message,
        });
    }
};

module.exports = {
    searchUsers,
};