const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');

router.get('/', materialController.getAllMaterials);
router.get('/:id', materialController.getMaterialById);
router.post('/', materialController.createMaterial);
router.put('/:id', materialController.updateMaterial);
router.delete('/:id', materialController.deleteMaterial);

//Stock
router.get('/with-stock', materialController.getMaterialsWithStock);
module.exports = router;