const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const quizController = require('../controllers/quizController');
const auth = require('../middlewares/auth');

router.post(
  '/',
  auth,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('difficulty').isIn(['easy', 'medium', 'hard']),
    body('duration')
      .isInt({ min: 1 })
      .withMessage('Duration must be at least 1 minute'),
  ],
  quizController.createQuiz,
);

router.put(
  '/:id',
  auth,
  [
    body('title').optional().notEmpty(),
    body('category').optional().notEmpty(),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
    body('duration').optional().isInt({ min: 1 }),
  ],
  quizController.updateQuiz,
);

router.delete('/:id', auth, quizController.deleteQuiz);

router.get('/public', quizController.getPublicQuizzes);
router.get('/my', auth, quizController.getMyQuizzes);

router.get('/:id/points', quizController.getQuizPoints);
router.get('/:id', auth, quizController.getQuizById);

router.get('/', quizController.getQuizzes);

module.exports = router;
