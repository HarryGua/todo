const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Pomodoro = require('../models/Pomodoro');

// 创建新的 Pomodoro 记录
router.post('/', auth, async (req, res) => {
  try {
    const pomodoro = new Pomodoro({
      ...req.body,
      userId: req.user.userId
    });
    await pomodoro.save();
    res.status(201).json(pomodoro);
  } catch (error) {
    res.status(500).json({ message: '创建 Pomodoro 记录失败' });
  }
});

// 获取用户的所有 Pomodoro 记录
router.get('/', auth, async (req, res) => {
  try {
    const pomodoros = await Pomodoro.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(pomodoros);
  } catch (error) {
    res.status(500).json({ message: '获取 Pomodoro 记录失败' });
  }
});

// 获取用户的统计信息
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Pomodoro.aggregate([
      { $match: { userId: req.user.userId } },
      {
        $group: {
          _id: null,
          totalPomodoros: { $sum: 1 },
          totalMinutes: { $sum: '$duration' },
          averageDuration: { $avg: '$duration' }
        }
      }
    ]);
    res.json(stats[0] || { totalPomodoros: 0, totalMinutes: 0, averageDuration: 0 });
  } catch (error) {
    res.status(500).json({ message: '获取统计信息失败' });
  }
});

// 清除用户的所有 Pomodoro 记录
router.delete('/all', auth, async (req, res) => {
  try {
    await Pomodoro.deleteMany({ userId: req.user.userId });
    res.json({ message: '所有记录已清除' });
  } catch (error) {
    res.status(500).json({ message: '清除记录失败' });
  }
});

module.exports = router; 