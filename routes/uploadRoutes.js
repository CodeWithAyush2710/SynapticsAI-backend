const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const upload = multer({ dest: "uploads/" });

app.post("/api/upload-resume", upload.single("resume"), async (req, res) => {
    const fileBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(fileBuffer);
    fs.unlinkSync(req.file.path); // Clean up

    res.json({ resumeText: pdfData.text });
});
