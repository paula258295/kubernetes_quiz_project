const User = require('../models/User');

exports.getGlobalRanking = async (req, res, next) => {
  try {
    const users = await User.find(
      { quizzesCompleted: { $gt: 1 } },
      'name email totalScore quizzesCompleted',
    )
      .sort({ totalScore: -1 })
      .limit(100);

    res.json(users);
  } catch (err) {
    next(err);
  }
};
