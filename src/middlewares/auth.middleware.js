const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized no token found' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized no user found' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
const adminMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized no token found' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('+systemGenerated');
        if (!user.systemGenerated || !user) {
            return res.status(401).json({ success: false, message: 'Unauthorized no user found' });
        }

        req.user = user;
        next();
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { authMiddleware, adminMiddleware };