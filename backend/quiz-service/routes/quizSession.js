const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const quizSessionController = require('../controllers/quizSessionController');

router.post('/start', auth, quizSessionController.startSession);
router.patch('/:sessionId', auth, quizSessionController.updateSession);
router.post('/finish', auth, quizSessionController.finishSession);
router.get('/my', auth, quizSessionController.getMySessions);
router.get('/:sessionId', auth, quizSessionController.getSession);

module.exports = router;
