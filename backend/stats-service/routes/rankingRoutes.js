const express = require('express');
const { getGlobalRanking } = require('../controllers/globalRankingController');
const { getWeeklyRanking } = require('../controllers/weeklyRankingController');

const router = express.Router();

router.get('/global', getGlobalRanking);
router.get('/weekly', getWeeklyRanking);

module.exports = router;
