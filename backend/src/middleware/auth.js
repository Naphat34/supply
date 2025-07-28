const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'ไม่ได้รับอนุญาตให้ใช้งาน' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error ('Token verification error:', error);
        return res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
    }
};