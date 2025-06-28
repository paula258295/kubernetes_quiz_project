const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const questionController = require('../controllers/questionController');
const auth = require('../middlewares/auth');

router.post(
  '/',
  auth,
  [
    body('quiz').notEmpty(),
    body('type').isIn(['single', 'multiple', 'boolean', 'open']),
    body('text').notEmpty(),
    body('points').isInt({ min: 1 }),
  ],
  questionController.createQuestion,
);

router.put('/:id', auth, questionController.updateQuestion);

router.delete('/:id', auth, questionController.deleteQuestion);

router.get('/quiz/:quizId', questionController.getQuestionsForQuiz);

router.put('/:id', auth, questionController.updateQuestion);
router.delete('/:id', auth, questionController.deleteQuestion);

router.get('/', questionController.getQuestions);

module.exports = router;
