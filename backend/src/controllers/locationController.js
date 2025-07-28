const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ดึงข้อมูลสถานที่จัดเก็บทั้งหมด
exports.getAllLocations = async (req, res) => {
    try {
        const locations = await prisma.location.findMany();
        res.json(locations);
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานที่จัดเก็บ' });
    }
};

// ดึงข้อมูลสถานที่จัดเก็บตาม id
exports.getLocationById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const location = await prisma.location.findUnique({
            where: { locationId: id }
        });
        if (!location) {
            return res.status(404).json({ error: 'ไม่พบสถานที่จัดเก็บ' });
        }
        res.json(location);
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานที่จัดเก็บ' });
    }
};

// เพิ่มสถานที่จัดเก็บ
exports.createLocation = async (req, res) => {
    const { locationName, description } = req.body;
    try {
        const location = await prisma.location.create({
            data: { locationName, description }
        });
        res.status(201).json(location);
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มสถานที่จัดเก็บ' });
    }
};

// แก้ไขสถานที่จัดเก็บ
exports.updateLocation = async (req, res) => {
    const id = parseInt(req.params.id);
    const { locationName, description } = req.body;
    try {
        const location = await prisma.location.update({
            where: { locationId: id },
            data: { locationName, description }
        });
        res.json(location);
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขสถานที่จัดเก็บ' });
    }
};

// ลบสถานที่จัดเก็บ
exports.deleteLocation = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await prisma.location.delete({
            where: { locationId: id }
        });
        res.json({ message: 'ลบสถานที่จัดเก็บเรียบร้อยแล้ว' });
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบสถานที่จัดเก็บ' });
    }
};