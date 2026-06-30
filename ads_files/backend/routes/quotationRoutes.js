const express = require('express');
const router = express.Router();
const { getQuotations, createQuotation, confirmQuotation, getTheatreRequests, respondToTheatreRequest, getMyQuotationRequests, respondToScreenSuggestion } = require('../controllers/quotationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getQuotations);
router.post('/', createQuotation);
router.get('/my-requests', getMyQuotationRequests);
router.get('/requests/theatre', getTheatreRequests);
router.post('/:id/confirm', confirmQuotation);
router.put('/:id/respond', respondToTheatreRequest);
router.post('/:id/screen-decision', respondToScreenSuggestion);

module.exports = router;
