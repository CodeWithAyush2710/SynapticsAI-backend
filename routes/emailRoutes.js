// const express = require('express');
// const router = express.Router();
// const { generateEmails } = require('../controllers/emailController');
// const { protect } = require('../middleware/authMiddleware');

// router.post('/generate', protect, generateEmails);

// module.exports = router;
// const express = require('express');
// const multer = require('multer');
// const fs = require('fs');
// const pdfParse = require('pdf-parse');

// const scrapePortal = require('../utils/scrapePortal');
// const generateEmail = require('../utils/generateColdEmail.js');

// const router = express.Router();
// const upload = multer({ dest: 'uploads/' });

// router.post('/email/generate', upload.single('resume'), async (req, res) => {
//   try {
//     const { url } = req.body;
//     const fileBuffer = fs.readFileSync(req.file.path);
//     const resumeData = await pdfParse(fileBuffer);
//     fs.unlinkSync(req.file.path); // delete uploaded file

//     const scrapedData = await scrapePortal(url);
//     const email = await generateEmail(scrapedData, resumeData.text);

//     res.json({ email });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to generate cold email" });
//   }
// });

// module.exports = router;

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const scrapePortal = require('../utils/scrapePortal');
const generateEmail = require('../utils/generateColdEmail.js');
const usageLimiter = require('../middleware/usageLimiter');
const User = require('../models/User'); // Import User for DB persistence

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', usageLimiter, upload.single('resume'), async (req, res) => {
  try {
    const { url } = req.body;
    let resumeText = null;

    if (req.file && fs.existsSync(req.file.path)) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const resumeData = await pdfParse(fileBuffer);
        resumeText = resumeData.text;
        
        // Save dynamically to user profile if authenticated
        if (req.user && req.user.id) {
          await User.findByIdAndUpdate(req.user.id, { resumeText });
          console.log(`Updated resume for user ${req.user.id}`);
        }
        
        fs.unlinkSync(req.file.path);
      } catch (parseError) {
          console.error("Error parsing uploaded resume:", parseError);
          resumeText = null;
          if (req.file && fs.existsSync(req.file.path)) {
              try { fs.unlinkSync(req.file.path); } catch (e) {}
          }
      }
    } else {
      // Fallback: check profile for saved resume
      if (req.user && req.user.id) {
        const user = await User.findById(req.user.id);
        if (user && user.resumeText) {
          resumeText = user.resumeText;
          console.log(`Using saved resume for user ${req.user.id}`);
        }
      }
    }

    const scrapedData = await scrapePortal(url);
    if (!scrapedData) {
      return res.status(400).json({ error: 'Failed to scrape job details from the provided URL. Please check the URL or try again later.' });
    }

    const emailResult = await generateEmail(scrapedData, resumeText);
    res.json({ email: emailResult });
  } catch (error) {
    console.error("Error in /api/email route:", error);
    res.status(500).json({ error: "Failed to generate cold email" });
  }
});

module.exports = router;
