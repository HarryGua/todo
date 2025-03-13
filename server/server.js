const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./routes/userRoutes');
const pomodoroRoutes = require('./routes/pomodoroRoutes');
const errorHandler = require('./middleware/errorHandler');

// 加载环境变量
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

// 创建 Express 应用
const app = express();

// 安全中间件
app.use(helmet()); // 添加各种 HTTP 头以增强安全性

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每个 IP 在 windowMs 内最多 100 个请求
  standardHeaders: true,
  legacyHeaders: false,
  message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);

// 中间件
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://pomodoro.example.com'] // 生产环境中允许的域名
    : 'http://localhost:5173', // 开发环境中允许的域名
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 连接数据库
console.log('尝试连接到 MongoDB:', process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB 连接成功');
  })
  .catch((error) => {
    console.error('MongoDB 连接失败:', error.message);
    console.error('错误详情:', error);
    
    // 检查是否是身份验证错误
    if (error.name === 'MongoServerError' && error.code === 18) {
      console.error('身份验证失败，请检查用户名和密码');
    }
    
    // 检查是否是网络错误
    if (error.name === 'MongoNetworkError') {
      console.error('网络错误，请检查网络连接和 MongoDB Atlas 的网络访问设置');
    }
  });

// API 路由
app.use('/api/users', userRoutes);
app.use('/api/pomodoros', pomodoroRoutes);

// 在生产环境中提供前端静态文件
if (process.env.NODE_ENV === 'production') {
  // 设置静态文件夹
  app.use(express.static(path.join(__dirname, '../todo/dist')));
  
  // 所有未匹配的路由都返回 index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../todo/dist/index.html'));
  });
} else {
  // 开发环境中的根路由
  app.get('/', (req, res) => {
    res.json({ message: 'Pomodoro API 服务器运行中' });
  });
}

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}，环境: ${process.env.NODE_ENV}`);
}); 