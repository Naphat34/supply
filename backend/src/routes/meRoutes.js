const { authMiddleware } = require('../middleware/auth');
const { get } = require('./authRoutes');

app.get("/api/me", authMiddleware, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { role: true, department: true }
    });

    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });

    res.json({
        userId: user.id,
        username: user.username,
        role: user.role,
        department: user.department,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
    });
});