const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 验证 JWT token 的中间件
const auth = async (req, res, next) => {
  try {
    // 从请求头中获取 token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }
    
    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找对应的用户
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: '用户不存在或令牌无效' });
    }
    
    // 将用户信息添加到请求对象中
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('认证错误:', error.message);
    res.status(401).json({ message: '请重新登录' });
  }
};

module.exports = auth; 