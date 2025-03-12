import { useState, useEffect } from 'react'
import './App.css'
import Timer from './components/Timer'
import Statistics from './components/Statistics'

function App() {
  const [history, setHistory] = useState([]);
  const [cycles, setCycles] = useState(0);
  
  // 从本地存储加载数据
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('pomodoroSettings');
      if (savedSettings) {
        const data = JSON.parse(savedSettings);
        setHistory(data.history || []);
        setCycles(data.cycles || 0);
      }
    } catch (e) {
      console.error('加载设置失败:', e);
    }
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Pomodoro 计时器</h1>
        <p>专注工作，高效休息</p>
      </header>
      <main>
        <Timer />
        <Statistics history={history} cycles={cycles} />
      </main>
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Pomodoro 计时器</p>
      </footer>
    </div>
  )
}

export default App
