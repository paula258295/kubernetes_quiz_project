const express = require('express');
const {
  getProfile,
  updateProfile,
  getMyStats,
  getUserById,
  addScore,
} = require('../controllers/userController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/me', auth, getProfile);
router.put('/me', auth, updateProfile);
router.get('/me/stats', auth, getMyStats);
router.get('/:id', getUserById);
router.post('/:id/score', addScore);
router.post('/:id/badges', async (req, res, next) => {
  try {
    const user = await require('../models/User').findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const newBadges = req.body.badges || [];
    user.badges = Array.from(new Set([...(user.badges || []), ...newBadges]));
    await user.save();
    res.json({ badges: user.badges });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
