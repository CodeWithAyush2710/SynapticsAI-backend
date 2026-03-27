const express = require('express');
const router = express.Router();
const { submitReview } = require('../controllers/reviewController');
// const { protect } = require('../middleware/authMiddleware');
const usageLimiter = require('../middleware/usageLimiter');

router.post('/', usageLimiter, submitReview);

module.exports = router;