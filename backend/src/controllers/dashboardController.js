const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardSummary = async (req, res) => {
    try {
        const [pendingCount, approvedCount, materialCount, userCount] = await Promise.all([
            prisma.request.count({ where: { approvalStatus: 'PENDING' } }),
            prisma.request.count({ where: { approvalStatus: 'APPROVED' } }),
            prisma.material.count(),
            prisma.user.count()
        ]);
        res.json({
            pendingCount,
            approvedCount,
            materialCount,
            userCount
        });
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล dashboard' });
    }
};

exports.getRecentApproved = async (req, res) => {
    try {
        const recent = await prisma.request.findMany({
            where: {
                approvalStatus: 'APPROVED',
                issuances: { some: {} }
            },
            include: {
                requester: true,
                department: true,
                issuances: true
            },
            orderBy: { approvedDate: 'desc' },
            take: 10
        });
        res.json(recent);
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงรายการที่อนุมัติแล้ว' });
    }
};