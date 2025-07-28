const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// ดึงข้อมูลสถานที่จัดเก็บทั้งหมด
router.get('/', locationController.getAllLocations);

// ดึงข้อมูลสถานที่จัดเก็บตาม id
router.get('/:id', locationController.getLocationById);

// เพิ่มสถานที่จัดเก็บ
router.post('/', locationController.createLocation);

// แก้ไขสถานที่จัดเก็บ
router.put('/:id', locationController.updateLocation);

// ลบสถานที่จัดเก็บ
router.delete('/:id', locationController.deleteLocation);

module.exports = router;