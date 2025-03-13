const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const pomodoroRoutes = require('./routes/pomodoros');

// 加载环境变量
dotenv.config();

// 创建 Express 应用
const app = express();

// 中间件
app.use(express.json());
app.use(cors());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pomodoros', pomodoroRoutes);

// 根路由
app.get('/', (req, res) => {
  res.send('Pomodoro API 正在运行');
});

// 连接到 MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('已连接到 MongoDB');
    
    // 启动服务器
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`服务器正在端口 ${PORT} 上运行`);
    });
  })
  .catch(err => {
    console.error('连接到 MongoDB 失败:', err.message);
    process.exit(1);
  });

// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', (err) => {
  console.error('未处理的 Promise 拒绝:', err);
  process.exit(1);
}); 