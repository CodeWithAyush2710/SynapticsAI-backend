const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();

app.use(cors());
app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/review', reviewRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to Synaptix AI Backend');
});

// app.listen(3000, () => {
//   console.log(`Server is running on http://localhost:3000`);
// });

module.exports = app