const QuizSession = require('../models/QuizSession');

exports.getWeeklyRanking = async (req, res, next) => {
  console.log('session controller!!');
  try {
    const now = new Date();
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(now.getDate() - dayOfWeek);

    const ranking = await QuizSession.aggregate([
      { $match: { finishedAt: { $gte: weekStart } } },
      {
        $group: {
          _id: '$user',
          weeklyScore: { $sum: '$score' },
          quizzesCompleted: { $sum: 1 },
        },
      },
      { $match: { quizzesCompleted: { $gt: 1 } } },
      { $sort: { weeklyScore: -1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          weeklyScore: 1,
          quizzesCompleted: 1,
          name: '$user.name',
          email: '$user.email',
        },
      },
    ]);
    res.json(ranking);
  } catch (err) {
    next(err);
  }
};
