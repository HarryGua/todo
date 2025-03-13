const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const pomodoroRoutes = require('./routes/pomodoroRoutes');
const errorHandler = require('./middleware/errorHandler');

// 加载环境变量
dotenv.config();

// 创建 Express 应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 连接数据库
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB 连接成功');
  })
  .catch((error) => {
    console.error('MongoDB 连接失败:', error.message);
  });

// 路由
app.use('/api/users', userRoutes);
app.use('/api/pomodoros', pomodoroRoutes);

// 根路由
app.get('/', (req, res) => {
  res.json({ message: 'Pomodoro API 服务器运行中' });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 