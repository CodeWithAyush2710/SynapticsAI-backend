const User = require('../models/User');
const fs = require('fs');
const pdfParse = require('pdf-parse');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ name: user.name, email: user.email, hasResume: !!user.resumeText });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Both current and new passwords are required' });
  }
  
  try {
    const user = await User.findById(req.user.id);
    const isMatch = await user.matchPassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update password' });
  }
};

exports.uploadResume = async (req, res) => {
  if (!req.file || !fs.existsSync(req.file.path)) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    const resumeData = await pdfParse(fileBuffer);
    
    await User.findByIdAndUpdate(req.user.id, { resumeText: resumeData.text });
    fs.unlinkSync(req.file.path);
    
    res.json({ message: 'Resume uploaded successfully' });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Failed to extract text from PDF' });
  }
};
