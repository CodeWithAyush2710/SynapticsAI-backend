const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dns = require('dns');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const validateEmailDomain = (email) => {
  return new Promise((resolve) => {
    const domain = email.split('@')[1];
    if (!domain) return resolve(false);
    dns.resolveMx(domain, (err, addresses) => {
      if (err || addresses.length === 0) resolve(false);
      else resolve(true);
    });
  });
};

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const isDomainValid = await validateEmailDomain(email);
    if (!isDomainValid) {
      return res.status(400).json({ message: 'Email domain does not exist or cannot receive emails' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};