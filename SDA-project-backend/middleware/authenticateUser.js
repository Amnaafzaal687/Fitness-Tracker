const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const token = req.cookies.jwt; // Assumes JWT is stored in a cookie
    if (!token) {
        return res.status(401).redirect('/login'); // Redirect to login if no token
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
            return res.status(403).redirect('/login'); // Redirect if token is invalid
        }
        req.user = { id: decoded.id }; // Attach user information to req.user
        next();
    });
};

module.exports = authenticateUser;
