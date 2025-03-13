import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useUser();
  
  // 如果正在加载，显示加载中
  if (loading) {
    return <div className="loading">加载中...</div>;
  }
  
  // 如果未登录，重定向到登录页面
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // 如果已登录，渲染子组件
  return children;
}

export default ProtectedRoute;
