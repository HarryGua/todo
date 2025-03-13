const Pomodoro = require('../models/Pomodoro');

// @desc    创建新的 Pomodoro 记录
// @route   POST /api/pomodoros
// @access  Private
const createPomodoro = async (req, res) => {
  try {
    const { type, duration, notes } = req.body;
    
    const pomodoro = await Pomodoro.create({
      user: req.user._id,
      type,
      duration,
      notes
    });
    
    res.status(201).json(pomodoro);
  } catch (error) {
    console.error('创建 Pomodoro 记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取当前用户的所有 Pomodoro 记录
// @route   GET /api/pomodoros
// @access  Private
const getPomodoros = async (req, res) => {
  try {
    const pomodoros = await Pomodoro.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    res.json(pomodoros);
  } catch (error) {
    console.error('获取 Pomodoro 记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取当前用户的 Pomodoro 统计信息
// @route   GET /api/pomodoros/stats
// @access  Private
const getPomodoroStats = async (req, res) => {
  try {
    // 获取总的 Pomodoro 数量
    const totalPomodoros = await Pomodoro.countDocuments({
      user: req.user._id,
      type: 'pomodoro'
    });
    
    // 获取今日的 Pomodoro 数量
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayPomodoros = await Pomodoro.countDocuments({
      user: req.user._id,
      type: 'pomodoro',
      createdAt: { $gte: today }
    });
    
    // 获取本周的 Pomodoro 数量
    const startOfWeek = new Date();
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekPomodoros = await Pomodoro.countDocuments({
      user: req.user._id,
      type: 'pomodoro',
      createdAt: { $gte: startOfWeek }
    });
    
    // 获取总专注时间（分钟）
    const totalFocusTime = await Pomodoro.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'pomodoro'
        }
      },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: '$duration' }
        }
      }
    ]);
    
    // 获取每日平均 Pomodoro 数量
    const distinctDays = await Pomodoro.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'pomodoro'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          }
        }
      },
      {
        $count: 'count'
      }
    ]);
    
    const totalDays = distinctDays.length > 0 ? distinctDays[0].count : 0;
    const dailyAverage = totalDays > 0 ? (totalPomodoros / totalDays).toFixed(1) : 0;
    
    res.json({
      totalPomodoros,
      todayPomodoros,
      weekPomodoros,
      totalFocusTime: totalFocusTime.length > 0 ? totalFocusTime[0].totalDuration : 0,
      dailyAverage
    });
  } catch (error) {
    console.error('获取 Pomodoro 统计信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    删除 Pomodoro 记录
// @route   DELETE /api/pomodoros/:id
// @access  Private
const deletePomodoro = async (req, res) => {
  try {
    const pomodoro = await Pomodoro.findById(req.params.id);
    
    if (!pomodoro) {
      return res.status(404).json({ message: '记录不存在' });
    }
    
    // 检查记录是否属于当前用户
    if (pomodoro.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '没有权限' });
    }
    
    await pomodoro.remove();
    
    res.json({ message: '记录已删除' });
  } catch (error) {
    console.error('删除 Pomodoro 记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    清除当前用户的所有 Pomodoro 记录
// @route   DELETE /api/pomodoros
// @access  Private
const clearPomodoros = async (req, res) => {
  try {
    await Pomodoro.deleteMany({ user: req.user._id });
    
    res.json({ message: '所有记录已清除' });
  } catch (error) {
    console.error('清除 Pomodoro 记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  createPomodoro,
  getPomodoros,
  getPomodoroStats,
  deletePomodoro,
  clearPomodoros
}; 