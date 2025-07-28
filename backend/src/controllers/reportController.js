const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// รายงาน 0: แสดงวัสดุทั้งหมดพร้อมจำนวนคงเหลือ
exports.getStockReport = async (req, res) => {
  try {
    const materials = await prisma.material.findMany({
      include: { category: true, StockLevel: true }
    });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// รายงาน 1: รายการการเบิกจ่ายวัสดุตามช่วงเวลา
exports.getRequisitionReport = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const requisitions = await prisma.request.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        department: true,
        requestItems: {
          include: { 
            material: true,
            IssuanceItem: true 
            }
        }
      }
    });

    const report = requisitions.map(req => ({
      requisition_number: req.requestNumber,
      date: req.createdAt,
      department: req.department?.department_name,
      items: req.requestItems.map(i => {
        const totalIssued = i.IssuanceItem.reduce((sum, iss) => sum + iss.issuedQuantity, 0);
        return {
          name: i.material?.materialNameTh,
          quantity: i.requestedQuantity,
          issued: totalIssued,
          unit: i.material?.unit
        };
      })
    }));

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requisition report' });
  }
};

// รายงาน 2: วัสดุที่คงเหลือน้อยกว่าจุดสั่งซื้อ
exports.getLowStockReport = async (req, res) => {
  try {
    const materials = await prisma.material.findMany({
      include: {
        category: true,
        stockTransactions: true
      }
    });

    const report = materials
      .map(material => {
        const balance = material.stockTransactions.reduce((acc, txn) => {
          return txn.transactionType === 'IN'
            ? acc + txn.quantity
            : acc - txn.quantity;
        }, 0);

        return {
          id: material.materialId,
          name: material.materialNameTh,
          category: material.category?.categoryName,
          balance,
          reorder_point: material.reorderPoint,
          unit: material.unit
        };
      })
      .filter(m => m.balance < (m.reorder_point || 0));

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch low stock report' });
  }
};

// รายงาน 3: เบิกตามวัสดุ (รวมทุกหน่วยงาน)
exports.getRequisitionByMaterial = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const requisitions = await prisma.request.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        requestItems: {
          include: {
            material: true
          }
        }
      }
    });

    const materialMap = {};

    requisitions.forEach(requisition => {
      requisition.requestItems.forEach(item => {
        const mat = item.material;
        if (!materialMap[mat.materialId]) {
          materialMap[mat.materialId] = {
            material_id: mat.materialId,
            name: mat.materialNameTh,
            unit: mat.unit,
            total_quantity: 0
          };
        }
        materialMap[mat.materialId].total_quantity += item.requestedQuantity;
      });
    });

    const report = Object.values(materialMap);
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate material requisition report' });
  }
};

// รายงาน 4: เบิกตามวัน (รวมทุกวัสดุ ทุกแผนก)
exports.getRequisitionByDate = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const requests = await prisma.request.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        requestItems: {
          include: {
            material: true
          }
        }
      }
    });

    const report = {};

    requests.forEach(req => {
      const date = req.createdAt.toISOString().split('T')[0];
      if (!report[date]) report[date] = [];

      req.requestItems.forEach(item => {
        report[date].push({
          material: item.material?.materialNameTh,
          quantity: item.requestedQuantity,
          unit: item.material?.unit
        });
      });
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate requisition-by-date report' });
  }
};

// รายงาน 5: เบิกตามแผนก (รวมวัสดุทั้งหมด)
exports.getRequisitionByDepartment = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format for startDate or endDate' });
    }

    const requisitions = await prisma.request.findMany({
      where: {
        requestDate: {
          gte: start,
          lte: end
        }
      },
      include: {
        department: true,
        requestItems: {
          include: {
            material: true,
            IssuanceItem: true  // <- เพิ่มส่วนนี้เพื่อให้ได้จำนวนจ่ายจริง
          }
        }
      }
    });

    const deptMap = {};

    requisitions.forEach(req => {
      const deptName = req.department?.department_name || 'ไม่ทราบหน่วยงาน';

      if (!deptMap[deptName]) {
        deptMap[deptName] = {};
      }

      req.requestItems.forEach(item => {
        const mat = item.material;
        const matName = mat?.materialNameTh || 'ไม่ทราบวัสดุ';

        if (!deptMap[deptName][matName]) {
          deptMap[deptName][matName] = {
            material: matName,
            unit: mat?.unit || '',
            total_quantity: 0,
            totalIssued: 0
          };
        }

        // รวมยอดขอเบิก
        deptMap[deptName][matName].total_quantity += item.requestedQuantity;

        // รวมยอดจ่ายจริง
        const totalIssued = item.IssuanceItem?.reduce((sum, i) => sum + i.issuedQuantity, 0) || 0;
        deptMap[deptName][matName].totalIssued += totalIssued;
      });
    });

    const report = Object.keys(deptMap).map(deptName => ({
      department: deptName,
      materials: Object.values(deptMap[deptName])
    }));

    res.json(report);
  } catch (error) {
    console.error('Error in getRequisitionByDepartment:', error);
    res.status(500).json({
      error: 'Failed to generate requisition by department report',
      details: error.message
    });
  }
};


// รายงาน 6: เบิกตามวัสดุ + แผนก + วันที่
exports.getRequisitionByDepartmentAndDate = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const requests = await prisma.request.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        department: true,
        requestItems: {
          include: {
            material: true
          }
        }
      }
    });

    const result = {};

    requests.forEach(req => {
      const date = req.createdAt.toISOString().split('T')[0];
      const dept = req.department?.department_name || 'ไม่ทราบแผนก';

      if (!result[date]) result[date] = {};
      if (!result[date][dept]) result[date][dept] = [];

      req.requestItems.forEach(item => {
        result[date][dept].push({
          material: item.material?.materialNameTh,
          quantity: item.requestedQuantity,
          unit: item.material?.unit
        });
      });
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate requisition by department and date report' });
  }
};
