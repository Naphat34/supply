const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// บันทึกการรับเข้า/เพิ่มสต๊อกวัสดุ
exports.addStock = async (req, res) => {
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Invalid request: body is missing or malformed.' });
    }
    const { materialId, quantity, remark, locationId } = req.body;
    if (!materialId || !quantity || !locationId) {
        return res.status(400).json({ error: 'materialId, quantity และ locationId จำเป็นต้องระบุ' });
    }
    try {
        // ตรวจสอบ locationId ว่ามีจริงหรือไม่
        const location = await prisma.location.findUnique({
            where: { locationId: parseInt(locationId) }
        });
        if (!location) {
            return res.status(400).json({ error: 'ไม่พบ locationId ที่ระบุ' });
        }
        // เพิ่ม transaction
        await prisma.stockTransaction.create({
            data: {
                materialId: parseInt(materialId),
                locationId: parseInt(locationId),
                quantity: parseInt(quantity),
                transactionType: 'IN',
                description: remark
            }
        });
        // อัปเดต StockLevel
        await prisma.stockLevel.upsert({
            where: { 
                unique_stock_level: {
                    materialId: parseInt(materialId),
                    locationId: parseInt(locationId)
                }
            },
            update: { quantity: { increment: parseInt(quantity) } },
            create: { materialId: parseInt(materialId), locationId: parseInt(locationId), quantity: parseInt(quantity) }
        });
        res.json({ message: 'เพิ่มสต๊อกสำเร็จ' });
    } catch (error) {
        console.error('Error in addStock:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มสต๊อก', detail: error.message });
    }
};

// การจ่ายวัสดุ (ตัดสต๊อก)
exports.issueStock = async (req, res) => {
    const { materialId, quantity, remark, locationId } = req.body;
    try {
        // ตรวจสอบ locationId ว่ามีจริงหรือไม่
        const location = await prisma.location.findUnique({
            where: { locationId: parseInt(locationId) }
        });
        if (!location) {
            return res.status(400).json({ error: 'ไม่พบ locationId ที่ระบุ' });
        }
        // ตรวจสอบ stock คงเหลือ
        const stock = await prisma.stockLevel.findFirst({
            where: { materialId: parseInt(materialId), locationId: parseInt(locationId) }
        });
        if (!stock || stock.quantity < quantity) {
            return res.status(400).json({ error: 'สต๊อกไม่เพียงพอ' });
        }
        // เพิ่ม transaction
        await prisma.stockTransaction.create({
            data: {
                materialId: parseInt(materialId),
                locationId: parseInt(locationId),
                quantity: -parseInt(quantity),
                transactionType: 'OUT',
                description: remark
            }
        });
        // อัปเดต StockLevel
        await prisma.stockLevel.update({
            where: { 
                unique_stock_level: {
                    materialId: parseInt(materialId),
                    locationId: parseInt(locationId)
                }
            },
            data: { quantity: { decrement: parseInt(quantity) } }
        });
        res.json({ message: 'จ่ายวัสดุสำเร็จ' });
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการจ่ายวัสดุ' });
    }
};

// ปรับปรุงสต๊อก (เช่น กรณีตรวจนับ)
exports.adjustStock = async (req, res) => {
    const { materialId, newQuantity, description, locationId } = req.body;
    try {
        // ตรวจสอบ locationId ว่ามีจริงหรือไม่
        const location = await prisma.location.findUnique({
            where: { locationId: parseInt(locationId) }
        });
        if (!location) {
            return res.status(400).json({ error: 'ไม่พบ locationId ที่ระบุ' });
        }

        const stock = await prisma.stockLevel.findFirst({
            where: { materialId: parseInt(materialId), locationId: parseInt(locationId) }
        });
        const oldQty = stock ? stock.quantity : 0;
        const diff = parseInt(newQuantity) - oldQty;

        let transactionType = diff >= 0 ? 'IN' : 'OUT';

        await prisma.stockTransaction.create({
            data: {
        materialId: parseInt(materialId),
        quantity: Math.abs(diff),
        transactionType,
        description,
        locationId: parseInt(locationId)
    }
        });

        await prisma.stockLevel.upsert({
            where: { 
                unique_stock_level: {
                    materialId: parseInt(materialId),
                    locationId: parseInt(locationId)
                }
            },
            update: { quantity: parseInt(newQuantity) },
            create: { materialId: parseInt(materialId), locationId: parseInt(locationId), quantity: parseInt(newQuantity) }
        });

        res.json({ message: 'ปรับปรุงสต๊อกสำเร็จ' });
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการปรับปรุงสต๊อก', detail: error.message });
    }
};

// ลบข้อมูลสต๊อกวัสดุ (ลบ StockLevel และ Transaction)
exports.deleteStock = async (req, res) => {
    const materialId = parseInt(req.params.materialId);
    try {
        await prisma.stockTransaction.deleteMany({ where: { materialId } });
        await prisma.stockLevel.delete({ where: { materialId } });
        res.json({ message: 'ลบข้อมูลสต๊อกวัสดุเรียบร้อยแล้ว' });
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูลสต๊อก' });
    }
};

exports.receiveMaterial = async (req, res) => {
  try {
    const { materialId, quantity, remark, locationId } = req.body;

    if (!materialId || !quantity || !locationId) {
      return res.status(400).json({ message: 'กรุณาระบุวัสดุ จำนวน และสถานที่เก็บ' });
    }

    const stock = await prisma.stockLevel.upsert({
      where: {
        unique_stock_level: {
          materialId: Number(materialId),
          locationId: Number(locationId),
        },
      },
      update: {
        quantity: { increment: Number(quantity) },
      },
      create: {
        materialId: Number(materialId),
        locationId: Number(locationId),
        quantity: Number(quantity),
      },
    });

    const transaction = await prisma.stockTransaction.create({
      data: {
        materialId: Number(materialId),
        locationId: Number(locationId),
        quantity: Number(quantity),
        transactionType: 'IN',
        description: remark || 'รับวัสดุเข้าระบบ',
      },
    });

    res.status(200).json({
      message: 'รับวัสดุเข้าระบบสำเร็จ',
      stock,
      transaction,
    });
  } catch (error) {
    console.error('[RECEIVE MATERIAL ERROR]', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการรับวัสดุเข้าระบบ' });
  }
};

