const express = require('express');
const router = express.Router();
const issuanceController = require('../controllers/issuanceController');

// ดึงรายการใบจ่ายทั้งหมด
router.get('/', issuanceController.getAllIssuances);

// ดึงข้อมูลใบจ่ายตาม ID
router.get('/:id', issuanceController.getIssuanceById);

// สร้างใบจ่ายใหม่
router.post('/', issuanceController.createIssuance);

// อัพเดทข้อมูลใบจ่าย
router.put('/:id', issuanceController.updateIssuance);

// ลบใบจ่าย
router.delete('/:id', issuanceController.deleteIssuance);

module.exports = router;