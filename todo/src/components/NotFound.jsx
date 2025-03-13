import { Link } from 'react-router-dom';
import '../styles/NotFound.css';

function NotFound() {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>您访问的页面不存在或已被移除。</p>
      <Link to="/" className="home-link">返回首页</Link>
    </div>
  );
}

export default NotFound; 