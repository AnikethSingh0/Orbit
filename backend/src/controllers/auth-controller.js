const UserService = require('../services/user-service.js');
const userService = new UserService();

const signup = async (req, res) => {
    try {
        const response = await userService.signup({
            email: req.body.email,
            password: req.body.password,
            username: req.body.username,
            fullName: req.body.fullName

        });
        return res.status(201).json({
            success: true,
            message: 'Successfully created a new user',
            data: response,
            err: {}
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while signing up',
            data: {},
            err: err
        });
    }
}

const login = async (req, res) => {
    try {
        if (!req.body || !req.body.email || !req.body.password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and password",
                data: {},
                err: "Missing credentials"
            });
        }
        const token = await userService.signin(req.body);
        return res.status(200).json({
            success: true,
            message: 'Successfully logged in',
            data: token,
            err: {}
        });
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Something went wrong while logging in',
            data: {},
            err: err.message || err
        });
    }
}

module.exports = {
    signup,
    login
};