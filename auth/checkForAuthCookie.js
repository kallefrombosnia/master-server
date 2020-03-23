const jwt = require('jsonwebtoken');

// Verify user token from cookie
const verifyToken = async (req, res, next) => {

    // Get token from cookie named token
    const token = req.cookies.token || '';

    try {

        // Check if cookie exists, maybe expired maybe user didnt have one - no login
        if (!token) {
            return next();
        }

        // Decrypt users jwt token and get information
        const decrypt = await jwt.verify(token, process.env.JWT_KEY);

        // Pass that infomation to request user object
        req.user = {
            id: decrypt.id,
            auth_level: decrypt.auth_level,
        };
        
        // Continue with exectution of app
        return next();

    } catch (err) {

        return res.status(500).json(err.toString());

    }
};

module.exports = verifyToken;