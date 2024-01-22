const jwt = require('jsonwebtoken');

const roleHeirarchy = {
    'Basic': 1,
    'User': 2,
    'Administrator': 3
}

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
        req.user = user;
        next();
    });
};

const checkRole = (requiredRole) => (req, res, next) => {
    const userRole = req.user.userLevel;
    if (roleHeirarchy[userRole] >= roleHeirarchy[requiredRole]) {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden' });
    }
};

module.exports = {
    authenticateToken,
    checkRole
};