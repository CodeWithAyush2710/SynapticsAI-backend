const express = require('express');
const multer = require('multer');
const router = express.Router();
const { getProfile, updatePassword, uploadResume } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

router.get('/profile', protect, getProfile);
router.put('/profile/password', protect, updatePassword);
router.post('/profile/resume', protect, upload.single('resume'), uploadResume);

module.exports = router;
