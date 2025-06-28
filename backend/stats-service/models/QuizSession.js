const mongoose = require('mongoose');

const quizSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [
    {
      question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
      answer: mongoose.Schema.Types.Mixed,
    },
  ],
  startedAt: { type: Date, default: Date.now },
  finishedAt: { type: Date },
  score: { type: Number },
});

module.exports = mongoose.model('QuizSession', quizSessionSchema);
