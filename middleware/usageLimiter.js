const jwt = require('jsonwebtoken');
const UnauthUsage = require('../models/UnauthUsage');

const usageLimiter = async (req, res, next) => {
  try {
    // 1. Check for valid JWT token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user payload to request
        return next(); // Authenticated users have unlimited access
      } catch (error) {
        // Token exists but is invalid/expired. Treat as unauthenticated.
        console.error("Invalid token:", error);
      }
    }

    // 2. Unauthenticated user logic based on IP
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Find or create usage record for this IP
    let usage = await UnauthUsage.findOne({ ipAddress });
    if (!usage) {
      usage = new UnauthUsage({ ipAddress, count: 0 });
    }

    // Check limit (2 free attempts)
    const LIMIT = 2;
    if (usage.count >= LIMIT) {
      return res.status(403).json({ error: 'Free limit reached. Please log in or sign up to continue using the services.' });
    }

    // Increment and save
    usage.count += 1;
    await usage.save();

    next();
  } catch (error) {
    console.error("Usage limiter error:", error);
    res.status(500).json({ error: 'Server error in usage limit check.' });
  }
};

module.exports = usageLimiter;
