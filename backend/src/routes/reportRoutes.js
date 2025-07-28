const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/stock', reportController.getStockReport);
router.get('/requisition', reportController.getRequisitionReport);
router.get('/low-stock', reportController.getLowStockReport);

//รายงานการเบิกจ่ายวัสดุตามวัน แผนก
router.get('/requisition-by-department', reportController.getRequisitionByDepartment);
//รายงานการเบิกจ่ายวัสดุตามวัน อุปกรณ์
router.get('/requisition-by-material', reportController.getRequisitionByMaterial);
//รายงานการเบิกจ่ายวัสดุตามวัน อุปกรณ์
router.get('/requisition-by-date', reportController.getRequisitionByDate);
//รายงานการเบิกจ่ายวัสดุตามวัน อุปกรณ์
router.get('/requisition-by-department-and-date', reportController.getRequisitionByDepartmentAndDate);


module.exports = router;
