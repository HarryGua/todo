const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 创建 Express 应用
const app = express();

// 中间件
app.use(express.json());
app.use(cors({
  origin: '*', // 允许所有来源的请求
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const pomodoroRoutes = require('./routes/pomodoros');

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pomodoros', pomodoroRoutes);

// 根路由 - 仅返回 JSON
app.get('/', (req, res) => {
  res.json({ message: 'Pomodoro API 正在运行', status: 'ok' });
});

// 捕获所有其他路由，返回 JSON 404
app.use('*', (req, res) => {
  res.status(404).json({ message: '路由不存在', status: 'error' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ message: '服务器内部错误', status: 'error' });
});

// 连接到 MongoDB
console.log('尝试连接到 MongoDB:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB 连接成功');
    
    // 启动服务器
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`API 服务器运行在端口 ${PORT}，环境: ${process.env.NODE_ENV}`);
    });
  })
  .catch(err => {
    console.error('MongoDB 连接失败:', err.message);
    console.error('错误详情:', err);
    process.exit(1);
  });

// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', (err) => {
  console.error('未处理的 Promise 拒绝:', err);
}); 