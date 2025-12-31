const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

exports.generateEmails = async (req, res) => {
  const filePath = path.join(__dirname, '../data/skills.csv');
  const emails = [];

  try {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const name = row.name || 'there';
        const skill = row.skill || 'your skills';
        const link = row.link || '#';
        const message = `Hi ${name},\n\nWe found your experience in ${skill} interesting. We'd love to connect! Check this out: ${link}\n\nRegards,\nSynaptix AI`;
        emails.push({ name, skill, link, message });
      })
      .on('end', () => {
        res.json({ success: true, emails });
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};