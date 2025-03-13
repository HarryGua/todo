import { createContext, useContext, useState, useEffect } from 'react';

// 创建用户上下文
const UserContext = createContext();

// 用户上下文提供者组件
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 在组件挂载时从本地存储中加载用户信息
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('currentUser');
        
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // 登录函数
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  // 登出函数
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  };

  // 更新用户信息
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  // 提供上下文值
  const value = {
    user,
    loading,
    login,
    logout,
    updateUser
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// 自定义钩子，用于访问用户上下文
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser 必须在 UserProvider 内部使用');
  }
  return context;
}

export default UserContext; 