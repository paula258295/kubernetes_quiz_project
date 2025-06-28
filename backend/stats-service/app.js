require('dotenv').config();
const express = require('express');
const errorHandler = require('./middlewares/errorHandler');
const rankingRoutes = require('./routes/rankingRoutes');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(cors());
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
  }),
);

app.use(express.json());

app.use('/api/stats', rankingRoutes);
app.get('/', (req, res) => {
  res.json({ message: 'Stats Service is running!' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Stats Service running on port ${PORT}`));
});

module.exports = app;
