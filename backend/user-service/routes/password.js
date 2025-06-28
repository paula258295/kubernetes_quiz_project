const express = require('express');
const {
  requestResetPassword,
  resetPassword,
} = require('../controllers/userController');

const router = express.Router();
console.log('Auth routes loaded');

router.post('/request-password-reset', requestResetPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
