const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await prisma.departments.findMany({
            include: {
                users: true
            }
        });
        res.json(departments);
    } catch (error) {
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนก'
        });
    }
};

exports.getDepartmentById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const department = await prisma.departments.findUnique({
            where: { department_id: id },
            include: {
                users: true
            }
        });
        if (!department) return res.status(404).json({ error: 'ไม่พบแผนก' });
        res.json(department);
    } catch (err) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนก' });
    }
};

exports.createDepartment = async (req, res) => {
    const { department_name, description } = req.body;
    try {
        //ตรวจสอบว่ามีชื่อแผนกซ้ำหรือไม่
        const existingDepartment = await prisma.departments.findUnique({
            where: { department_name }
        });
        if (existingDepartment) {
            return res.status(400).json({ 
                error: 'มีชื่อแผนกอยู่ในระบบแล้ว' 
            });
        }
        const department = await prisma.departments.create({
            data: {
                department_name,
                description
            }
        });
        res.status(201).json(department);
    } catch (error) {
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการสร้างแผนก'
        });
    }
};

exports.updateDepartment = async (req, res) => {
    const id = parseInt(req.params.id);
    const { department_name, description } = req.body;
    try {
        //ตรวจสอบว่ามีชื่อแผนกซ้ำหรือไม่ (ยกเว้นแผนกปัจจุบัน)
        const existingDepartment = await prisma.departments.findUnique({
            where: { 
                department_name,
            NOT: {
                department_id: id
            } 
        }
        });
        if (existingDepartment) {
            return res.status(400).json({
                error: 'มีชื่อแผนกอยู่ในระบบแล้ว'
            });
        }
        const department = await prisma.departments.update({
            where: { department_id: id },
            data: {
                department_name,
                description
            }
        });
        res.json(department);
    } catch (error) {
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการอัปเดตแผนก:' + error.message
        });
    }
};

exports.deleteDepartment = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        //ตรวจสอบว่ามีผู้ใช้งานในแผนกหรือไม่
        const departmentWithUsers = await prisma.departments.findUnique({
            where: { department_id: id },
            include: {
                users: true
            }
        });
        if (departmentWithUsers.users.length > 0) {
            return res.status(400).json({
                error: 'ไม่สามารถลบแผนกนี้ได้เนื่องจากมีผู้ใช้งานในแผนก'
            });
        }
        await prisma.departments.delete({
            where: { department_id: id }
        });
        res.json({ message: 'ลบแผนกเรียบร้อยแล้ว' });
    } catch (error) {
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการลบแผนก'
        });
    }
};