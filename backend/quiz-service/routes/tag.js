const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const auth = require('../middlewares/auth');

router.get('/', tagController.getTags);
router.post('/', auth, tagController.createTag);
router.delete('/:id', auth, tagController.deleteTag);

module.exports = router;
