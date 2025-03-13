const express = require('express');
const router = express.Router();
const {
  createPomodoro,
  getPomodoros,
  getPomodoroStats,
  deletePomodoro,
  clearPomodoros
} = require('../controllers/pomodoroController');
const auth = require('../middleware/auth');

// 所有路由都需要认证
router.use(auth);

// 创建新的 Pomodoro 记录
router.post('/', createPomodoro);

// 获取当前用户的所有 Pomodoro 记录
router.get('/', getPomodoros);

// 获取当前用户的 Pomodoro 统计信息
router.get('/stats', getPomodoroStats);

// 删除 Pomodoro 记录
router.delete('/:id', deletePomodoro);

// 清除当前用户的所有 Pomodoro 记录
router.delete('/', clearPomodoros);

module.exports = router; 