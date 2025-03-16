import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import { userAPI } from '../services/api';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
    console.log('开始验证表单数据:', formData);
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
    
    // 验证密码
    if (!formData.password) {
      newErrors.password = '密码不能为空';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    }
    
    // 验证确认密码
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    
    setErrors(newErrors);
    console.log('表单验证结果:', Object.keys(newErrors).length === 0 ? '通过' : '失败', newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('提交表单，表单数据:', formData);
    
    if (!validateForm()) {
      console.log('表单验证失败，终止提交');
      return;
    }
    
    setIsLoading(true);
    console.log('开始发送注册请求...');
    console.log('API URL:', import.meta.env.VITE_API_URL);
    
    try {
      // 调用注册 API
      const { confirmPassword, ...registerData } = formData;
      console.log('发送到后端的数据:', registerData);
      
      const response = await userAPI.register(registerData);
      
      console.log('注册成功，后端响应:', response.data);
      
      // 注册成功后跳转到登录页
      navigate('/login', { state: { message: '注册成功，请登录' } });
    } catch (error) {
      console.error('注册失败，错误详情:', error);
      
      // 详细记录错误信息
      if (error.response) {
        console.error('错误响应状态:', error.response.status);
        console.error('错误响应数据:', error.response.data);
      } else if (error.request) {
        console.error('请求已发送但未收到响应:', error.request);
      } else {
        console.error('请求设置出错:', error.message);
      }
      
      // 处理错误响应
      if (error.response && error.response.data) {
        if (error.response.data.message && error.response.data.message.includes('邮箱')) {
          setErrors({ email: error.response.data.message });
        } else if (error.response.data.message && error.response.data.message.includes('用户名')) {
          setErrors({ username: error.response.data.message });
        } else {
          setErrors({ general: error.response.data.message || '注册失败，请稍后再试' });
        }
      } else {
        setErrors({ general: '注册失败，无法连接到服务器，请检查网络连接或稍后再试' });
      }
    } finally {
      setIsLoading(false);
      console.log('注册请求处理完成');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>用户注册</h2>
        
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
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入密码"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">确认密码</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="请再次输入密码"
            />
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>
          
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? '注册中...' : '注册'}
          </button>
        </form>
        
        <div className="auth-footer">
          已有账号？ <Link to="/login">立即登录</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;