const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                materials: true
            }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่'
        });
    }
};

exports.getCategoryById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const category = await prisma.category.findUnique({
            where: { categoryId: id },
            include: {
                materials: true
            }
        });
        if (!category) {
            return res.status(404).json({ error: 'ไม่พบหมวดหมู่ที่ต้องการ' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่'
        });
    }
};

exports.createCategory = async (req, res) => {
    const { categoryName, description } = req.body;

    try {
        // ตรวจสอบว่ามีชื่อหมวดหมู่นี้อยู่แล้วหรือไม่
        const existingCategory = await prisma.category.findUnique({
            where: { categoryName }
        });

        if (existingCategory) {
            return res.status(400).json({
                error: 'ชื่อนี้มีอยู่ในระบบแล้ว'
            });
        }

        const category = await prisma.category.create({
            data: {
                categoryName,
                description
            }
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่'
        });
    }
};

exports.updateCategory = async (req, res) => {
    const id = parseInt(req.params.id);
    const { categoryName, description } = req.body;

    try {
        // ตรวจสอบว่ามีหมวดหมู่ที่ต้องการแก้ไขอยู่ในระบบหรือไม่
        const existingCategory = await prisma.category.findUnique({
            where: { categoryId: id }
        });

        if (!existingCategory) {
            return res.status(404).json({
                error: 'ไม่พบหมวดหมู่ที่ต้องการแก้ไข'
            });
        }

        // ตรวจสอบว่าชื่อหมวดหมู่ใหม่ซ้ำกับหมวดหมู่อื่นหรือไม่ (ถ้ามีการเปลี่ยนชื่อ)
        if (categoryName !== existingCategory.categoryName) {
            const duplicateName = await prisma.category.findUnique({
                where: { categoryName }
            });

            if (duplicateName) {
                return res.status(400).json({
                    error: 'ชื่อหมวดหมู่นี้มีอยู่ในระบบแล้ว'
                });
            }
        }

        const category = await prisma.category.update({
            where: { categoryId: id },
            data: {
                categoryName,
                description
            }
        });

        res.json(category);
    } catch (error) {
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลหมวดหมู่'
        });
    }
};

exports.deleteCategory = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        // ตรวจสอบว่ามีหมวดหมู่ที่ต้องการลบอยู่ในระบบหรือไม่
        const category = await prisma.category.findUnique({
            where: { categoryId: id },
            include: {
                materials: true
            }
        });

        if (!category) {
            return res.status(404).json({
                error: 'ไม่พบหมวดหมู่ที่ต้องการลบ'
            });
        }

        // ตรวจสอบว่าหมวดหมู่นี้มีวัสดุที่เกี่ยวข้องหรือไม่
        if (category.materials.length > 0) {
            return res.status(400).json({
                error: 'ไม่สามารถลบหมวดหมู่นี้ได้เนื่องจากมีวัสดุที่เกี่ยวข้อง'
            });
        }

        await prisma.category.delete({
            where: { categoryId: id }
        });

        res.json({ message: 'ลบหมวดหมู่เรียบร้อยแล้ว' });
    } catch (error) {
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการลบหมวดหมู่'
        });
    }
};

exports.getCategories = async (req, res) => {
    try {
      const categories = await prisma.category.findMany();
      res.json(categories);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  };