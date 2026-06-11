const { User } = require('../models');
const { success, error } = require('../utils/response');

exports.addReputationScore = async (userId, change, reason, relatedId = null, relatedType = null) => {
  const user = await User.findByPk(userId);
  if (!user) return null;

  const previousScore = parseFloat(user.reputationScore);
  const previousLevel = user.reputationLevel;

  let newScore = previousScore + change;
  newScore = Math.max(0, Math.min(100, newScore));

  user.reputationScore = newScore.toFixed(2);
  user.reputationLevel = user.calculateReputationLevel();
  await user.save();

  const { ReputationRecord } = require('../models');
  await ReputationRecord.create({
    userId,
    changeType: reason,
    scoreChange: change,
    previousScore,
    newScore,
    previousLevel,
    newLevel: user.reputationLevel,
    relatedId,
    relatedType,
    reason
  });

  return user;
};

exports.updateCompletionRate = async (userId, completed = true) => {
  const user = await User.findByPk(userId);
  if (!user) return null;

  const totalTrips = user.totalTrips + 1;
  let completedTrips = Math.round(user.completionRate * user.totalTrips / 100);
  if (completed) completedTrips += 1;

  user.totalTrips = totalTrips;
  user.completionRate = totalTrips > 0 ? ((completedTrips / totalTrips) * 100).toFixed(2) : 100;
  await user.save();

  return user;
};

exports.getReputationHistory = async (req, res) => {
  try {
    const user = req.user;
    const { ReputationRecord } = require('../models');
    const { page, pageSize, offset, limit } = require('../utils/response').pagination(req.query.page, req.query.pageSize);

    const { count, rows } = await ReputationRecord.findAndCountAll({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });

    success(res, require('../utils/response').paginateResult(rows, count, page, pageSize));
  } catch (err) {
    error(res, '获取信誉记录失败: ' + err.message, 500);
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const user = req.user;
    const { Review, User } = require('../models');
    const { page, pageSize, offset, limit } = require('../utils/response').pagination(req.query.page, req.query.pageSize);
    const type = req.query.type || 'received';

    const where = type === 'received' ? { revieweeId: user.id } : { reviewerId: user.id };

    const { count, rows } = await Review.findAndCountAll({
      where,
      include: [
        { model: User, as: 'reviewer', attributes: ['id', 'nickname', 'avatar'] },
        { model: User, as: 'reviewee', attributes: ['id', 'nickname', 'avatar'] }
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });

    success(res, require('../utils/response').paginateResult(rows, count, page, pageSize));
  } catch (err) {
    error(res, '获取评价列表失败: ' + err.message, 500);
  }
};
