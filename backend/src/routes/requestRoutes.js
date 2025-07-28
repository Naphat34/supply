const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

router.get('/next-number', requestController.getNextRequisitionNumber);
router.get('/:id', requestController.getRequestById);

router.get('/', requestController.getAllRequests);
router.get('/history', requestController.getRequestApprovalHistory);
router.get('/:id', requestController.getRequestById);
router.post('/', requestController.createRequest);
router.put('/:id', requestController.updateRequest);
router.delete('/:id', requestController.deleteRequest);

// เพิ่มเส้นทางสำหรับการอนุมัติ
router.put('/:requestId/approve', requestController.updateRequestApproval);
router.get('/pending', requestController.getPendingRequests);

router.put('/:id/status', requestController.updateStatus);

router.get('/requisitions/stats', requestController.getRequisitionStats);


// เพิ่มเส้นทางสำหรับการค้นหาข้อมูลการเบิก





module.exports = router;