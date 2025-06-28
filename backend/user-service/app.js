require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const cors = require('cors');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/password');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
  }),
);

app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/password', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'User Service is running!' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5002;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
});

module.exports = app;
