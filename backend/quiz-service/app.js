require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const cors = require('cors');

const quizRoutes = require('./routes/quiz');
const questionRoutes = require('./routes/question');
const quizSessionRoutes = require('./routes/quizSession');
const categoryRoutes = require('./routes/category');
const tagRoutes = require('./routes/tag');

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

app.use('/api/quiz', quizRoutes);
app.use('/api/question', questionRoutes);
app.use(
  '/api/session',
  (req, res, next) => {
    console.log('Proxying /api/session app.js');
    next();
  },
  quizSessionRoutes,
);

app.use('/api/category', categoryRoutes);
app.use('/api/tag', tagRoutes);

app.get('/', (req, res) => {
  console.log('jakis consolelog');
  res.json({ message: 'Quiz Service is running!' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Quiz Service running on port ${PORT}`));
});

module.exports = app;