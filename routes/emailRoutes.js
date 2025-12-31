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

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('resume'), async (req, res) => { // Keep multer middleware, but handle missing file
  try {
    const { url } = req.body;
    let resumeText = null; // Default to null if no resume provided

    // Check if file was uploaded and process it
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const resumeData = await pdfParse(fileBuffer);
        resumeText = resumeData.text; // Get resume text
        console.log("Extracted Resume Text Length:", resumeText ? resumeText.length : 'N/A');
        // Delete the file after reading it
        fs.unlinkSync(req.file.path);
      } catch (parseError) {
          console.error("Error parsing uploaded resume:", parseError);
          // Optionally return an error, or just proceed without resume text
          // return res.status(400).json({ error: 'Failed to parse uploaded resume file.' });
          console.warn("Proceeding without parsed resume text due to parsing error.");
          resumeText = null; // Ensure resumeText is null if parsing failed
          // Clean up the file even if parsing failed
          if (req.file && fs.existsSync(req.file.path)) {
              try { fs.unlinkSync(req.file.path); } catch (unlinkErr) { console.error("Error deleting failed-parse resume file:", unlinkErr); }
          }
      }
    } else {
      console.log("No resume file uploaded or file missing, proceeding without resume text.");
    }

    // Scrape the portal data
    const scrapedData = await scrapePortal(url);
    console.log("Scraped Data:", scrapedData); // Log scraped data

    // Check if scraping failed
    if (!scrapedData) {
      console.log("Scraping failed, returning error.");
      return res.status(400).json({ error: 'Failed to scrape job details from the provided URL. Please check the URL or try again later.' });
    }

    // Generate the email using scraped data and resume text
    console.log("Calling generateEmail function...");
    const emailResult = await generateEmail(scrapedData, resumeText); // Use extracted resumeText
    console.log("Result from generateEmail:", emailResult); // Log the result

    // Send the generated email as response
    res.json({ email: emailResult }); // Use the result variable
  } catch (error) {
    console.error("Error in /api/email route:", error); // Log error in route handler specifically
    res.status(500).json({ error: "Failed to generate cold email" });
  }
});

module.exports = router;
