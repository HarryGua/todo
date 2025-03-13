import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import { useUser } from '../contexts/UserContext';
import { userAPI } from '../services/api';
import Loading from './Loading';

function Profile() {
  const { user, updateUser } = useUser();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // 加载用户数据
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除相关字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // 验证用户名
    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少需要3个字符';
    }
    
    // 验证邮箱
    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    
    // 如果输入了密码，验证密码
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = '密码至少需要6个字符';
      }
      
      // 验证确认密码
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 准备更新数据
      const updateData = {
        username: formData.username,
        email: formData.email
      };
      
      // 如果输入了密码，添加到更新数据中
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      // 调用更新 API
      const response = await userAPI.updateProfile(updateData);
      const userData = response.data;
      
      // 更新用户上下文
      updateUser(userData);
      
      // 显示成功消息
      setMessage('个人信息更新成功');
      
      // 清除密码字段
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('更新失败:', error);
      
      // 处理错误响应
      if (error.response && error.response.data) {
        if (error.response.data.message.includes('邮箱')) {
          setErrors({ email: error.response.data.message });
        } else if (error.response.data.message.includes('用户名')) {
          setErrors({ username: error.response.data.message });
        } else {
          setErrors({ general: error.response.data.message || '更新失败，请稍后再试' });
        }
      } else {
        setErrors({ general: '更新失败，请稍后再试' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <Loading />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>个人资料</h2>
        
        {message && <div className="success-message">{message}</div>}
        {errors.general && <div className="error-message">{errors.general}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="请输入用户名"
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">电子邮箱</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="请输入电子邮箱"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">新密码 (可选)</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="留空表示不修改密码"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">确认新密码</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="再次输入新密码"
            />
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>
          
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? '更新中...' : '更新资料'}
          </button>
        </form>
        
        <div className="auth-footer">
          <button 
            className="back-button" 
            onClick={() => navigate('/')}
          >
            返回主页
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile; 