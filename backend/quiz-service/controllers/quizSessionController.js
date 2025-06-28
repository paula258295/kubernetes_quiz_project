const QuizSession = require('../models/QuizSession');
const Question = require('../models/Question');
const fetch = (...args) =>
  import('node-fetch').then((mod) => mod.default(...args));

exports.startSession = async (req, res, next) => {
  try {
    let session = await QuizSession.findOne({
      user: req.user.userId,
      quiz: req.body.quizId,
      finishedAt: null,
    });
    if (!session) {
      session = new QuizSession({
        user: req.user.userId,
        quiz: req.body.quizId,
        answers: [],
        startedAt: new Date(),
      });
      await session.save();
    }
    res.json(session);
  } catch (err) {
    next(err);
  }
};

exports.updateSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { answers } = req.body;
    const session = await QuizSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.finishedAt)
      return res.status(400).json({ message: 'Session already finished' });
    session.answers = answers;
    await session.save();
    res.json(session);
  } catch (err) {
    next(err);
  }
};

exports.finishSession = async (req, res, next) => {
  try {
    const { sessionId, answers } = req.body;
    const session = await QuizSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    session.answers = answers;
    session.finishedAt = new Date();

    const questions = await Question.find({ quiz: session.quiz });
    let score = 0;
    for (const q of questions) {
      const userAnswer = answers.find((a) => a.question == q._id.toString());
      if (!userAnswer) continue;
      if (
        (q.type === 'single' || q.type === 'boolean') &&
        userAnswer.answer === q.correctAnswers[0]
      ) {
        score += q.points || 1;
      }
      if (
        q.type === 'multiple' &&
        Array.isArray(userAnswer.answer) &&
        Array.isArray(q.correctAnswers)
      ) {
        const a1 = [...userAnswer.answer].filter(x => x !== '').sort();
        const a2 = [...q.correctAnswers].filter(x => x !== '').sort();
        if (a1.length === a2.length && a1.every((v, i) => v === a2[i])) {
          score += q.points || 1;
        }
      }
    }
    session.score = score;
    await session.save();

    await fetch(`http://user-service:5002/api/user/${req.user.userId}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score }),
    });

    const response = await fetch(
      `http://user-service:5002/api/user/${req.user.userId}`,
    );
    const user = await response.json();
    const quizzesCompleted = user.quizzesCompleted || 0;
    const totalScore = user.totalScore || 0;
    const newBadges = [];

    if (quizzesCompleted === 1 && !user.badges.includes('First Quiz')) {
      newBadges.push('First Quiz');
    }
    if (quizzesCompleted === 5 && !user.badges.includes('Quiz Novice')) {
      newBadges.push('Quiz Novice');
    }
    if (quizzesCompleted === 30 && !user.badges.includes('Quiz Master')) {
      newBadges.push('Quiz Master');
    }
    if (totalScore >= 30 && !user.badges.includes('30 Points Club')) {
      newBadges.push('30 Points Club');
    }
    if (totalScore >= 100 && !user.badges.includes('100 Points Club')) {
      newBadges.push('100 Points Club');
    }
    if (totalScore >= 200 && !user.badges.includes('200 Points Club')) {
      newBadges.push('200 Points Club');
    }

    if (newBadges.length > 0) {
      await fetch(
        `http://user-service:5002/api/user/${req.user.userId}/badges`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ badges: newBadges }),
        },
      );
    }

    res.json({
      sessionId: session._id,
      score,
      maxScore: questions.reduce((s, q) => s + (q.points || 1), 0),
      newBadges,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMySessions = async (req, res, next) => {
  try {
    const sessions = await QuizSession.find({ user: req.user.userId })
      .populate('quiz')
      .sort({ startedAt: -1 });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

exports.getSession = async (req, res, next) => {
  try {
    const session = await QuizSession.findById(req.params.sessionId).populate(
      'quiz',
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    next(err);
  }
};
