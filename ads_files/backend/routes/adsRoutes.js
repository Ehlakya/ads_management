const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createAd, getAds, getAdById, updateAd } = require('../controllers/adsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `video-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

router.use(protect);

// Routes accessible by SuperAdmin, Admin, AND Agent
router.get('/:id', getAdById);

// Routes restricted to SuperAdmin and Admin ONLY
router.get('/', authorize('superadmin', 'admin'), getAds);
router.post('/', authorize('superadmin', 'admin'), upload.single('video_file'), createAd);
router.put('/:id', authorize('superadmin', 'admin'), upload.single('video_file'), updateAd);

module.exports = router;
