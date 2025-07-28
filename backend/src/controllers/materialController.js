const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllMaterials = async (req, res) => {
    try {
        const materials = await prisma.material.findMany({
            include: {
                category: true,
                location: true,
                StockLevel: {
                    include: {
                        location: true
                    }
                }
            }
        });
        // รวม stock ทุก location
        const result = materials.map(m => ({
            ...m,
            locationId: m.locationId,
            locationName: m.location?.locationName || '-',
            stock: m.StockLevel ? m.StockLevel.reduce((sum, s) => sum + s.quantity, 0) : 0 
        }));
        res.json(result);
    } catch (error) {
        console.error(error); // ดู error log ที่ terminal
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลวัสดุ' });
    }
};

exports.getMaterialById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const material = await prisma.material.findUnique({
      where: { materialId: id },
      include: {
        category: true,
        location: true, // ✅ เพิ่ม location เพื่อให้ frontend ได้ข้อมูล
      }
    });

    if (!material) {
      return res.status(404).json({ error: 'ไม่พบวัสดุที่ต้องการ' });
    }

    // เพิ่ม stock ถ้าต้องการ
    const stock = await prisma.stockLevel.aggregate({
      where: { materialId: id },
      _sum: { quantity: true }
    });

    res.json({
      ...material,
      stock: stock._sum.quantity || 0
    });
  } catch (error) {
    console.error('[GET MATERIAL ERROR]', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลวัสดุ'
    });
  }
};




exports.createMaterial = async (req, res) => {
  try {
    const {
      materialCode,
      materialNameTh,
      materialNameEn,
      unit,
      categoryId,
      locationId,
      reorderPoint,
      safetyStock,
      description
    } = req.body;

    const newMaterial = await prisma.material.create({
      data: {
        materialCode,
        materialNameTh,
        materialNameEn: materialNameEn || null,
        unit,
        categoryId: Number(categoryId),
        locationId: Number(locationId),
        reorderPoint: reorderPoint !== null && reorderPoint !== '' ? Number(reorderPoint) : null,
        safetyStock: safetyStock !== null && safetyStock !== '' ? Number(safetyStock) : null,
        description: description || null,
      }
    });

    // Create initial stock level (quantity 0)
    const stockLevel = await prisma.stockLevel.create({
      data: {
        materialId: newMaterial.materialId,
        locationId: Number(locationId),
        quantity: 0
      }
    });

    // Create initial stock transaction (quantity 0, type 'INITIAL')
    await prisma.stockTransaction.create({
      data: {
        materialId: newMaterial.materialId,
        locationId: Number(locationId),
        quantity: 0,
        transactionType: 'IN',
        description: 'รับเข้ารอบเช้า'
      }
    });

    res.status(201).json(newMaterial);
  } catch (error) {
    console.error('[CREATE MATERIAL ERROR]', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลวัสดุ' });
  }
};


exports.updateMaterial = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { materialCode, materialNameTh, materialNameEn, unit, categoryId, reorderPoint, safetyStock, description, locationId } = req.body;
        const material = await prisma.material.update({
            where: { materialId: id },
            data: {
                materialCode,
                materialNameTh,
                materialNameEn,
                unit,
                categoryId: parseInt(categoryId),
                reorderPoint: reorderPoint ? parseInt(reorderPoint) : null,
                safetyStock: safetyStock ? parseInt(safetyStock) : null,
                description,
                locationId: locationId ? parseInt(locationId) : null
            }
        });
        res.json(material);
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขวัสดุ' });
    }
};

exports.deleteMaterial = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const material = await prisma.material.findUnique({
      where: { materialId: id }
    });

    if (!material) {
      return res.status(404).json({ error: 'ไม่พบวัสดุที่ต้องการลบ' });
    }

    // ลบความสัมพันธ์ทั้งหมดที่เกี่ยวข้องกับวัสดุนี้
    await prisma.$transaction([
      prisma.requestItem.deleteMany({ where: { materialId: id } }),
      prisma.issuanceItem.deleteMany({ where: { materialId: id } }),
      prisma.stockTransaction.deleteMany({ where: { materialId: id } }),
      prisma.stockLevel.deleteMany({ where: { materialId: id } }),
      prisma.material.delete({ where: { materialId: id } })
    ]);

    res.json({ message: 'ลบวัสดุและความสัมพันธ์เรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error in force delete:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบวัสดุ' });
  }
};


// แสดงรายการวัสดุพร้อมจำนวนคงเหลือ
exports.getMaterialsWithStock = async (req, res) => {
    try {
      const materials = await prisma.material.findMany({
        include: {
          category: true,
        },
      });
  
      const result = materials.map((material) => ({
        id: material.id,
        name: material.name,
        category: material.category?.name || 'ไม่ระบุ',
        unit: material.unit,
        stock: material.current_stock || 0,
      }));
  
      res.status(200).json(result);
    } catch (err) {
      console.error('Error fetching materials with stock:', err);
      res.status(500).json({ error: 'Failed to fetch materials with stock' });
    }
  };