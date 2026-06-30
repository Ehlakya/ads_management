const express = require('express');
const router = express.Router();
const { 
  createAdmin, 
  createAgent, 
  getUsers,
  getTheatreRequests,
  getTheatreRequestStatus,
  approveTheatreRequest,
  rejectTheatreRequest
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

// Allowed for both Super Admin and Admin (logic for filtering is in the controller)
router.get('/', authorize('superadmin', 'admin'), getUsers);

// Theatre user request routes
router.get('/theatre-requests', authorize('superadmin', 'admin'), getTheatreRequests);
router.get('/theatre-requests/:id', getTheatreRequestStatus);
router.post('/theatre-requests/:id/approve', authorize('superadmin', 'admin'), approveTheatreRequest);
router.post('/theatre-requests/:id/reject', authorize('superadmin', 'admin'), rejectTheatreRequest);

// Restricted to Super Admin
router.post('/create-admin', authorize('superadmin'), createAdmin);

// Restricted to Super Admin and Admin
router.post('/create-agent', authorize('superadmin', 'admin'), createAgent);

module.exports = router;
