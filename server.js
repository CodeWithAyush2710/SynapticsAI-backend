const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/review', reviewRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to Synaptix AI Backend');
});

// Always start server (Render requires this)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
