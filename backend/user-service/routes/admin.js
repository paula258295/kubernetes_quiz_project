const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');

router.get('/users', auth, requireRole('admin'), adminController.getAllUsers);

module.exports = router;
