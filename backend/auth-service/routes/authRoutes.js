const express = require('express');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');
const passport = require('passport');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required.')
      .isLength({ min: 3, max: 50 })
      .withMessage('Name must be between 3 and 50 characters long.')
      .matches(/^[a-zA-Z0-9\s]+$/)
      .withMessage('Name can only contain letters, numbers, and spaces.'),

    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required.')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),

    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required.')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long.')
      .matches(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={[\]\\|:;"'<>,.?/~`])/,
      )
      .withMessage(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      ),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authController.registerUser,
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authController.login,
);

router.post('/validate', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res
        .status(401)
        .json({
          valid: false,
          message: 'Token expired',
          expiredAt: err.expiredAt,
        });
    }
    res
      .status(401)
      .json({ valid: false, message: `Invalid or expired token: ${err}` });
  }
});

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
    );
    res.redirect(`http://localhost:3000/social-login?token=${token}`);
  },
);

module.exports = router;
