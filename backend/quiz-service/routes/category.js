const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middlewares/auth');
const requireRole = require('../middlewares/roles').requireRole;

router.get('/', categoryController.getCategories);
router.post('/', auth, requireRole('admin'), categoryController.createCategory);
router.put(
  '/:id',
  auth,
  requireRole('admin'),
  categoryController.updateCategory,
);
router.delete(
  '/:id',
  auth,
  requireRole('admin'),
  categoryController.deleteCategory,
);

module.exports = router;
