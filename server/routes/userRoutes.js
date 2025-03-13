const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} = require('../controllers/userController');
const auth = require('../middleware/auth');

// 注册新用户
router.post('/register', registerUser);

// 用户登录
router.post('/login', loginUser);

// 获取用户信息
router.get('/profile', auth, getUserProfile);

// 更新用户信息
router.put('/profile', auth, updateUserProfile);

module.exports = router; 