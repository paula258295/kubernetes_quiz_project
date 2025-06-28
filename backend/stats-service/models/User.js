const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  googleId: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
  totalScore: { type: Number, default: 0 },
  quizzesCompleted: { type: Number, default: 0 },
  badges: { type: [String], default: [] },
  authType: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
});

module.exports = mongoose.model('User', userSchema);
