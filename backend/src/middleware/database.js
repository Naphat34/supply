const prisma = require('../prisma/client');

const checkDatabaseConnection = async (req, res, next) => {
    try {
        // ทดสอบการเชื่อมต่อ
        await prisma.$queryRaw`SELECT 1`;
        next();
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            type: 'DB_CONNECTION_ERROR',
            message: 'ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้'
        });
    }
};

module.exports = checkDatabaseConnection;