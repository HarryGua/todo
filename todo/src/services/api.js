import axios from 'axios';

// 获取 API URL 环境变量，如果不存在则使用默认值
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器，添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器，处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 处理 401 错误（未授权）
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 模拟 API 功能（当后端不可用时使用）
const useMockAPI = false; // 设置为 false 禁用模拟 API，使用真实的后端 API

// 模拟用户数据
const mockUsers = [
  {
    _id: '1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  }
];

// 模拟 Pomodoro 记录
const mockPomodoros = [];

// 用户 API
export const userAPI = {
  // 注册
  register: async (userData) => {
    if (useMockAPI) {
      console.log('使用模拟 API 注册用户:', userData);
      
      // 检查邮箱是否已被注册
      const existingUser = mockUsers.find(user => user.email === userData.email);
      if (existingUser) {
        return Promise.reject({
          response: {
            status: 400,
            data: { message: '该邮箱已被注册' }
          }
        });
      }
      
      // 创建新用户
      const newUser = {
        _id: String(mockUsers.length + 1),
        ...userData,
        token: 'mock_token_' + Date.now()
      };
      
      mockUsers.push(newUser);
      
      return Promise.resolve({
        data: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          token: newUser.token
        }
      });
    }
    
    return api.post('/users/register', userData);
  },
  
  // 登录
  login: async (credentials) => {
    if (useMockAPI) {
      console.log('使用模拟 API 登录:', credentials);
      
      // 查找用户
      const user = mockUsers.find(user => 
        user.email === credentials.email && 
        user.password === credentials.password
      );
      
      if (user) {
        return Promise.resolve({
          data: {
            _id: user._id,
            username: user.username,
            email: user.email,
            token: 'mock_token_' + Date.now()
          }
        });
      } else {
        return Promise.reject({
          response: {
            status: 401,
            data: { message: '邮箱或密码不正确' }
          }
        });
      }
    }
    
    return api.post('/users/login', credentials);
  },
  
  // 获取用户信息
  getProfile: async () => {
    if (useMockAPI) {
      console.log('使用模拟 API 获取用户信息');
      
      // 从本地存储获取用户信息
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (userData && userData._id) {
        return Promise.resolve({ data: userData });
      } else {
        return Promise.reject({
          response: {
            status: 401,
            data: { message: '未授权' }
          }
        });
      }
    }
    
    return api.get('/users/profile');
  },
  
  // 更新用户信息
  updateProfile: async (userData) => {
    if (useMockAPI) {
      console.log('使用模拟 API 更新用户信息:', userData);
      
      // 从本地存储获取用户信息
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (currentUser && currentUser._id) {
        // 更新用户信息
        const updatedUser = {
          ...currentUser,
          ...userData,
          token: 'mock_token_' + Date.now()
        };
        
        // 更新模拟用户数据
        const userIndex = mockUsers.findIndex(user => user._id === currentUser._id);
        if (userIndex !== -1) {
          mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            ...userData
          };
        }
        
        return Promise.resolve({ data: updatedUser });
      } else {
        return Promise.reject({
          response: {
            status: 401,
            data: { message: '未授权' }
          }
        });
      }
    }
    
    return api.put('/users/profile', userData);
  }
};

// Pomodoro API
export const pomodoroAPI = {
  // 创建 Pomodoro 记录
  create: async (data) => {
    if (useMockAPI) {
      console.log('使用模拟 API 创建 Pomodoro 记录:', data);
      
      // 从本地存储获取用户信息
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (userData && userData._id) {
        // 创建新记录
        const newRecord = {
          _id: String(mockPomodoros.length + 1),
          ...data,
          user: userData._id,
          createdAt: new Date().toISOString()
        };
        
        mockPomodoros.push(newRecord);
        
        return Promise.resolve({ data: newRecord });
      } else {
        return Promise.reject({
          response: {
            status: 401,
            data: { message: '未授权' }
          }
        });
      }
    }
    
    return api.post('/pomodoros', data);
  },
  
  // 获取所有 Pomodoro 记录
  getAll: async () => {
    if (useMockAPI) {
      console.log('使用模拟 API 获取所有 Pomodoro 记录');
      
      // 从本地存储获取用户信息
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (userData && userData._id) {
        // 获取用户的记录
        const userRecords = mockPomodoros.filter(record => record.user === userData._id);
        
        return Promise.resolve({ data: userRecords });
      } else {
        return Promise.reject({
          response: {
            status: 401,
            data: { message: '未授权' }
          }
        });
      }
    }
    
    return api.get('/pomodoros');
  },
  
  // 获取统计信息
  getStats: async () => {
    if (useMockAPI) {
      console.log('使用模拟 API 获取统计信息');
      
      // 从本地存储获取用户信息
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (userData && userData._id) {
        // 获取用户的记录
        const userRecords = mockPomodoros.filter(record => record.user === userData._id);
        
        // 计算统计信息
        const totalPomodoros = userRecords.filter(record => record.type === 'pomodoro').length;
        
        // 获取今日的记录
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayPomodoros = userRecords.filter(record => 
          record.type === 'pomodoro' && 
          new Date(record.createdAt) >= today
        ).length;
        
        // 获取本周的记录
        const startOfWeek = new Date();
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const weekPomodoros = userRecords.filter(record => 
          record.type === 'pomodoro' && 
          new Date(record.createdAt) >= startOfWeek
        ).length;
        
        // 计算总专注时间
        const totalFocusTime = userRecords
          .filter(record => record.type === 'pomodoro')
          .reduce((total, record) => total + record.duration, 0);
        
        // 计算日均番茄钟
        const dailyAverage = totalPomodoros > 0 ? (totalPomodoros / 7).toFixed(1) : 0;
        
        return Promise.resolve({
          data: {
            totalPomodoros,
            todayPomodoros,
            weekPomodoros,
            totalFocusTime,
            dailyAverage
          }
        });
      } else {
        return Promise.reject({
          response: {
            status: 401,
            data: { message: '未授权' }
          }
        });
      }
    }
    
    return api.get('/pomodoros/stats');
  },
  
  // 删除 Pomodoro 记录
  delete: async (id) => {
    if (useMockAPI) {
      console.log('使用模拟 API 删除 Pomodoro 记录:', id);
      
      // 从本地存储获取用户信息
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (userData && userData._id) {
        // 查找记录
        const recordIndex = mockPomodoros.findIndex(record => 
          record._id === id && record.user === userData._id
        );
        
        if (recordIndex !== -1) {
          // 删除记录
          mockPomodoros.splice(recordIndex, 1);
          
          return Promise.resolve({ data: { message: '记录已删除' } });
        } else {
          return Promise.reject({
            response: {
              status: 404,
              data: { message: '记录不存在' }
            }
          });
        }
      } else {
        return Promise.reject({
          response: {
            status: 401,
            data: { message: '未授权' }
          }
        });
      }
    }
    
    return api.delete(`/pomodoros/${id}`);
  },
  
  // 清除所有 Pomodoro 记录
  clearAll: async () => {
    if (useMockAPI) {
      console.log('使用模拟 API 清除所有 Pomodoro 记录');
      
      // 从本地存储获取用户信息
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (userData && userData._id) {
        // 清除用户的记录
        const userRecordIndexes = mockPomodoros
          .map((record, index) => record.user === userData._id ? index : -1)
          .filter(index => index !== -1)
          .sort((a, b) => b - a); // 从后往前删除
        
        userRecordIndexes.forEach(index => {
          mockPomodoros.splice(index, 1);
        });
        
        return Promise.resolve({ data: { message: '所有记录已清除' } });
      } else {
        return Promise.reject({
          response: {
            status: 401,
            data: { message: '未授权' }
          }
        });
      }
    }
    
    return api.delete('/pomodoros');
  }
};

export default api; 