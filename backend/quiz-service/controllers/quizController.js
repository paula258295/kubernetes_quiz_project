const Quiz = require('../models/Quiz');
const { validationResult } = require('express-validator');

exports.createQuiz = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const {
      title,
      description,
      category,
      difficulty,
      duration,
      isPrivate,
      tags,
    } = req.body;
    const quiz = new Quiz({
      title,
      description,
      category,
      difficulty,
      duration,
      isPrivate,
      owner: req.user.userId,
      tags,
    });
    await quiz.save();
    res.status(201).json({ message: 'Quiz created', quiz });
  } catch (err) {
    next(err);
  }
};

exports.updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (
      quiz.owner.toString() !== req.user.userId &&
      req.user.role !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'Forbidden: insufficient permissions' });
    }
    Object.assign(quiz, req.body);
    await quiz.save();
    res.json({ message: 'Quiz updated', quiz });
  } catch (err) {
    next(err);
  }
};

exports.deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (
      quiz.owner.toString() !== req.user.userId &&
      req.user.role !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'Forbidden: insufficient permissions' });
    }

    await quiz.deleteOne();
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    next(err);
  }
};

exports.getQuizzes = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category,
      difficulty,
      tags,
    } = req.query;
    const query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }
    if (tags) {
      const tagArray = tags.split(',').map((tag) => tag.trim());
      query.tags = { $all: tagArray };
    }

    const quizzes = await Quiz.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Quiz.countDocuments(query);

    res.json({
      quizzes,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

exports.getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (
      quiz.isPrivate &&
      (!req.user ||
        (quiz.owner.toString() !== req.user.userId &&
          req.user.role !== 'admin'))
    ) {
      return res
        .status(403)
        .json({ message: 'Forbidden: insufficient permissions' });
    }

    res.json(quiz);
  } catch (err) {
    next(err);
  }
};

const Question = require('../models/Question');

exports.getQuizPoints = async (req, res, next) => {
  try {
    const quizId = req.params.id;
    const questions = await Question.find({ quiz: quizId });
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    res.json({ totalPoints });
  } catch (err) {
    next(err);
  }
};

exports.getPublicQuizzes = async (req, res, next) => {
  try {
    const { category, difficulty, search, page = 1, limit = 10, tags } = req.query;
    const query = { isPrivate: false };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }
    if (tags) {
      const tagArray = tags.split(',').map((tag) => tag.trim());
      query.tags = { $all: tagArray };
    }

    const quizzes = await Quiz.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Quiz.countDocuments(query);

    res.json({
      quizzes,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyQuizzes = async (req, res, next) => {
  try {
    const {
      category,
      difficulty,
      search,
      page = 1,
      limit = 10,
      tags,
    } = req.query;
    const query = { owner: req.user.userId };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }
    if (tags) {
      const tagArray = tags.split(',').map((tag) => tag.trim());
      query.tags = { $all: tagArray };
    }

    const quizzes = await Quiz.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Quiz.countDocuments(query);

    res.json({
      quizzes,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};
