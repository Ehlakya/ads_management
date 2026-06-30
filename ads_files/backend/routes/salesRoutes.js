const express = require('express');
const router = express.Router();
const { createSale, getSales, updateSaleStatus } = require('../controllers/salesController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getSales);
router.post('/', createSale);
router.put('/:id/status', authorize('superadmin', 'admin'), updateSaleStatus);

module.exports = router;
