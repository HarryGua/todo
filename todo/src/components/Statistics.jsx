import React, { useState, useEffect } from 'react';
import '../styles/Statistics.css';
import { pomodoroAPI } from '../services/api';
import Loading from './Loading';

function Statistics() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 从后端获取统计信息和历史记录
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 获取统计信息
        const statsResponse = await pomodoroAPI.getStats();
        setStats(statsResponse.data);
        
        // 获取历史记录
        const historyResponse = await pomodoroAPI.getAll();
        setHistory(historyResponse.data);
        
        setError('');
      } catch (error) {
        console.error('获取数据失败:', error);
        setError('获取数据失败，请稍后再试');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // 清除所有记录
  const handleClearHistory = async () => {
    if (window.confirm('确定要清除所有记录吗？此操作不可撤销。')) {
      setIsLoading(true);
      try {
        await pomodoroAPI.clearAll();
        
        // 重新获取数据
        const statsResponse = await pomodoroAPI.getStats();
        setStats(statsResponse.data);
        
        setHistory([]);
        setError('');
      } catch (error) {
        console.error('清除记录失败:', error);
        setError('清除记录失败，请稍后再试');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="statistics-container">
      <h2>统计信息</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {stats && (
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.totalPomodoros}</div>
            <div className="stat-label">总番茄钟</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{stats.todayPomodoros}</div>
            <div className="stat-label">今日番茄钟</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{stats.weekPomodoros}</div>
            <div className="stat-label">本周番茄钟</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{stats.dailyAverage}</div>
            <div className="stat-label">日均番茄钟</div>
          </div>
        </div>
      )}
      
      {stats && (
        <div className="time-stats">
          <div className="time-stat">
            <span className="time-label">总专注时间:</span>
            <span className="time-value">{stats.totalFocusTime} 分钟</span>
          </div>
          
          <div className="time-stat">
            <span className="time-label">平均每个番茄钟:</span>
            <span className="time-value">
              {stats.totalPomodoros > 0 
                ? (stats.totalFocusTime / stats.totalPomodoros).toFixed(1) 
                : 0} 分钟
            </span>
          </div>
        </div>
      )}
      
      {history.length > 0 && (
        <div className="history-section">
          <h3>历史记录</h3>
          <div className="history-list">
            {history.slice(0, 10).map((entry, index) => (
              <div key={index} className="history-item">
                <div className="history-type">
                  {entry.type === 'pomodoro' ? '专注' : 
                   entry.type === 'shortBreak' ? '短休息' : '长休息'}
                </div>
                <div className="history-duration">{entry.duration} 分钟</div>
                <div className="history-date">{formatDate(entry.createdAt)}</div>
              </div>
            ))}
          </div>
          
          {history.length > 10 && (
            <div className="history-more">
              显示最近 10 条记录（共 {history.length} 条）
            </div>
          )}
        </div>
      )}
      
      <div className="statistics-actions">
        <button className="clear-button" onClick={handleClearHistory}>
          清除所有记录
        </button>
      </div>
    </div>
  );
}

export default Statistics; 