import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import { useUser } from '../contexts/UserContext';

function Navbar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  
  // 处理登出
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Pomodoro 计时器
        </Link>
        
        <div className="navbar-menu">
          {user ? (
            <>
              <span className="navbar-username">欢迎，{user.username}</span>
              <Link to="/statistics" className="navbar-link">统计</Link>
              <Link to="/profile" className="navbar-link">个人资料</Link>
              <button onClick={handleLogout} className="navbar-button">登出</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">登录</Link>
              <Link to="/register" className="navbar-link">注册</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
