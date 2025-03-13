// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // 默认错误状态码和消息
  let statusCode = 500;
  let message = '服务器内部错误';
  
  // 处理 Mongoose 验证错误
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map(error => error.message);
    message = errors.join(', ');
  }
  
  // 处理 Mongoose 重复键错误
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} 已存在`;
  }
  
  // 处理 JWT 错误
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = '无效的令牌';
  }
  
  // 处理 JWT 过期错误
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = '令牌已过期';
  }
  
  // 发送错误响应
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler; 