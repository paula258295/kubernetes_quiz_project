const Question = require('../models/Question');
const { validationResult } = require('express-validator');

exports.createQuestion = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const question = new Question({
      ...req.body,
      points: Number(req.body.points) || 1
    });
    await question.save();
    res.status(201).json({ message: 'Question created', question });
  } catch (err) {
    next(err);
  }
};

exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question)
      return res.status(404).json({ message: 'Question not found' });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    next(err);
  }
};

exports.getQuestionsForQuiz = async (req, res, next) => {
  try {
    const questions = await Question.find({ quiz: req.params.quizId });
    res.json(questions);
  } catch (err) {
    next(err);
  }
};

exports.getQuestions = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.quiz) {
      query.quiz = req.query.quiz;
    }
    const questions = await Question.find(query);
    res.json(questions);
  } catch (err) {
    next(err);
  }
};

exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question)
      return res.status(404).json({ message: 'Question not found' });
    Object.assign(question, req.body);
    await question.save();
    res.json(question);
  } catch (err) {
    next(err);
  }
};