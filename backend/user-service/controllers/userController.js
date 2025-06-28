const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
let transporterPromise = (async () => {
  let testAccount = await nodemailer.createTestAccount();
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  return transporter;
})();

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.name) user.name = req.body.name;

    if (req.body.oldPassword && req.body.newPassword) {
      const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ message: 'Old password is incorrect' });
      user.password = await bcrypt.hash(req.body.newPassword, 10);
    }

    await user.save();
    res.json({ message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: 'Token and new password are required' });
  }
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset' });
  } catch (err) {
    next(err);
  }
};

exports.requestResetPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(200)
        .json({ message: 'If the email exists, a reset link has been sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 3600000;
    await user.save();

    const transporter = await transporterPromise;
    const resetLink = `http://localhost:3000/reset-password/confirm?token=${token}`;
    const info = await transporter.sendMail({
      to: email,
      subject: 'Password Reset',
      html: `<p>Click to reset: <a href="${resetLink}">${resetLink}</a></p>`,
    });
    console.log('RESET LINK:', resetLink);
    res.json({
      message: 'Reset link sent if email exists.',
      resetLink: resetLink,
      previewUrl: nodemailer.getTestMessageUrl(info)
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({
      totalScore: user.totalScore || 0,
      quizzesCompleted: user.quizzesCompleted || 0,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.addScore = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.totalScore = (user.totalScore || 0) + (req.body.score || 0);
    user.quizzesCompleted = (user.quizzesCompleted || 0) + 1;
    await user.save();
    res.json({
      totalScore: user.totalScore,
      quizzesCompleted: user.quizzesCompleted,
    });
  } catch (err) {
    next(err);
  }
};
