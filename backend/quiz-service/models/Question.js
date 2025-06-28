const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  type: {
    type: String,
    enum: ['single', 'multiple', 'boolean', 'open'],
    required: true,
  },
  text: { type: String, required: true },
  options: [String],
  correctAnswers: [String],
  points: { type: Number, default: 1 },
  hint: String,
});

module.exports = mongoose.model('Question', questionSchema);
