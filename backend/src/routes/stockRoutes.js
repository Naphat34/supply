const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// เพิ่มสต๊อกวัสดุ
router.post('/add', stockController.addStock);

// จ่ายวัสดุ (ตัดสต๊อก)
router.post('/issue', stockController.issueStock);

// ปรับปรุงสต๊อก
router.post('/adjust', stockController.adjustStock);

// ลบข้อมูลสต๊อกวัสดุ
router.delete('/:materialId', stockController.deleteStock);

router.post('/receive', stockController.receiveMaterial);

module.exports = router;