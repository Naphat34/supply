const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                department: true
            }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
    }
};

exports.getUserById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const user = await prisma.user.findUnique({
            where: { userId: id },
            include: {
                department: true
            }
        });
        if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
    }
};

exports.createUser = async (req, res) => {
    const { username, password, firstName, lastName, email, phoneNumber, departmentId, role } = req.body;
    try {
        // ตรวจสอบว่ามี username หรือ email ซ้ำหรือไม่
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว' });
        }

        // เข้ารหัสรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                firstName,
                lastName,
                email,
                phoneNumber,
                departmentId: parseInt(departmentId),
                role
            },
            include: {
                department: true
            }
        });
        
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้: ' + err.message });
    }
};

exports.updateUser = async (req, res) => {
    const id = parseInt(req.params.id);
    const { username, password, firstName, lastName, email, phoneNumber, departmentId, role } = req.body;
    try {
        // ตรวจสอบว่ามี username หรือ email ซ้ำหรือไม่ (ยกเว้นผู้ใช้ปัจจุบัน)
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ],
                NOT: {
                    userId: id
                }
            }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว' });
        }

        let updateData = {
            username,
            firstName,
            lastName,
            email,
            phoneNumber,
            departmentId: parseInt(departmentId),
            role
        };

        // อัพเดทรหัสผ่านเฉพาะเมื่อมีการส่งมา
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { userId: id },
            data: updateData,
            include: {
                department: true
            }
        });
        
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: 'เกิดข้อผิดพลาดในการอัพเดทผู้ใช้: ' + err.message });
    }
};

exports.deleteUser = async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: 'รหัสผู้ใช้ไม่ถูกต้อง' });
    }

    try {
        const deletedUser = await prisma.user.delete({
            where: {
                userId: id  // << ต้องใช้ userId ตาม schema
            }
        });

        res.json({ message: 'ลบผู้ใช้เรียบร้อยแล้ว', user: deletedUser });
    } catch (err) {
        console.error('❌ ลบผู้ใช้ผิดพลาด:', err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบผู้ใช้: ' + err.message });
    }
};
