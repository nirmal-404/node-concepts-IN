

const logger = require('../utils/logger')
const { validateRegistration } = require('../utils/validation')
const { validateLogin } = require('../utils/validation')
const User = require('../models/User');
const generateTokens = require('../utils/generateToken');
const RefreshToken = require('../models/RefreshToken');
const { log } = require('winston');

// user registration
const registerUser = async (req, res) => {
    logger.info("Registraion endpoint hit");

    try {
        logger.info('request received')
        // validate the schema
        const { error } = validateRegistration(req.body);
        if (error) {
            logger.warn("Validation error", error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { username, email, password } = req.body;

        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            logger.warn("User already exists");
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        user = new User({ username, email, password })
        await user.save()
        logger.warn("User saved successfully", user._id);

        const { accessToken, refreshToken } = await generateTokens(user);

        res.status(201).json({
            success: true,
            message: "User registered successfully !",
            accessToken,
            refreshToken
        })
    } catch (e) {
        logger.error("Registration error occured ", e);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// user login
const loginUser = async (req, res) => {
    logger.info("Login endpoint hit");
    try {
        const { error } = validateLogin(req.body);
        if (error) {
            logger.warn("Validation error", error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            logger.warn("User not found");
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isValidPassword = await user.comparePasswords(password, user.password);
        if (!isValidPassword) {
            logger.warn("Invalid password");
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            });
        }

        const { accessToken, refreshToken } = await generateTokens(user);
        res.json({
            accessToken,
            refreshToken,
            userId: user._id,
        });
    } catch (e) {
        logger.error("Login error occured ", e);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// refresh token
const refreshTokenUser = async (req, res) => {
    logger.info("Refresh token endpoint hit");
    try {
        const { refreshToken } = req.body;
        console.log(refreshToken)
        if (!refreshToken) {
            logger.warn("Refresh token is missing");
            return res.status(400).json({
                success: false,
                message: "Refresh token is missing"
            });
        }

        const storedToken = await RefreshToken.findOne({ token: refreshToken });
        if (!storedToken || storedToken.expiresAt < Date.now()) {
            logger.warn("Invalid or expired refresh token")
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token"
            });
        }

        const user = await User.findById(storedToken.user)

        if (!user) {
            logger.warn("User not found")
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokens(user)

        // delete the existing token
        await RefreshToken.deleteOne({ _id: storedToken._id });

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (e) {
        logger.error("Refresh token error occured ", e);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


// user logout
const logoutUser = async (req, res) => {
    logger.info("Logout endpoint hit");
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            logger.warn("Refresh token is missing");
            return res.status(400).json({
                success: false,
                message: "Refresh token is missing"
            });
        }

        await RefreshToken.deleteOne({ token: refreshToken });
        logger.info('Refresh token deleted for logout')

        res.json({
            success: true,
            message: "User logged out successfully"
        });

    } catch (e) {
        logger.error("Logout error occured ", e);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}



module.exports = { registerUser, loginUser, refreshTokenUser, logoutUser }