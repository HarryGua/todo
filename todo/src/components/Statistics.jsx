import React from 'react';
import '../styles/Statistics.css';

function Statistics({ history, cycles }) {
  // 计算今日完成的番茄钟数量
  const todayPomodoros = history.filter(entry => 
    entry.type === 'pomodoro' && 
    new Date(entry.date).toDateString() === new Date().toDateString()
  ).length;

  // 计算总专注时间（分钟）
  const totalFocusTime = Math.round(
    history
      .filter(entry => entry.type === 'pomodoro')
      .reduce((total, entry) => total + entry.duration, 0)
  );

  // 计算本周完成的番茄钟数量
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };
  
  const thisWeekPomodoros = history.filter(entry => {
    const entryDate = new Date(entry.date);
    const now = new Date();
    return (
      entry.type === 'pomodoro' && 
      entryDate.getFullYear() === now.getFullYear() && 
      getWeekNumber(entryDate) === getWeekNumber(now)
    );
  }).length;

  // 计算平均每日完成的番茄钟数量
  const calculateDailyAverage = () => {
    if (history.length === 0) return 0;
    
    // 获取所有不同的日期
    const dates = [...new Set(
      history
        .filter(entry => entry.type === 'pomodoro')
        .map(entry => new Date(entry.date).toDateString())
    )];
    
    if (dates.length === 0) return 0;
    
    return (history.filter(entry => entry.type === 'pomodoro').length / dates.length).toFixed(1);
  };

  return (
    <div className="statistics-container">
      <h2>统计信息</h2>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{cycles}</div>
          <div className="stat-label">总番茄钟</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">{todayPomodoros}</div>
          <div className="stat-label">今日番茄钟</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">{thisWeekPomodoros}</div>
          <div className="stat-label">本周番茄钟</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">{calculateDailyAverage()}</div>
          <div className="stat-label">日均番茄钟</div>
        </div>
      </div>
      
      <div className="time-stats">
        <div className="time-stat">
          <span className="time-label">总专注时间:</span>
          <span className="time-value">{totalFocusTime} 分钟</span>
        </div>
        
        <div className="time-stat">
          <span className="time-label">平均每个番茄钟:</span>
          <span className="time-value">
            {history.length > 0 
              ? (totalFocusTime / history.filter(entry => entry.type === 'pomodoro').length).toFixed(1) 
              : 0} 分钟
          </span>
        </div>
      </div>
    </div>
  );
}

export default Statistics; 