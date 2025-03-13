import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Timer from './components/Timer'
import Statistics from './components/Statistics'
import Register from './components/Register'
import Login from './components/Login'
import Profile from './components/Profile'
import NotFound from './components/NotFound'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { UserProvider } from './contexts/UserContext'

function App() {
  // 移除不再需要的状态
  // const [history, setHistory] = useState([]);
  // const [cycles, setCycles] = useState(0);
  
  // 移除不再需要的 useEffect
  // useEffect(() => {
  //   try {
  //     const savedSettings = localStorage.getItem('pomodoroSettings');
  //     if (savedSettings) {
  //       const data = JSON.parse(savedSettings);
  //       setHistory(data.history || []);
  //       setCycles(data.cycles || 0);
  //     }
  //   } catch (e) {
  //     console.error('加载设置失败:', e);
  //   }
  // }, []);

  return (
    <UserProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <div className="app-content">
                  <header className="app-header">
                    <h1>Pomodoro 计时器</h1>
                    <p>专注工作，高效休息</p>
                  </header>
                  <main>
                    <Timer />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/statistics" element={
              <ProtectedRoute>
                <div className="app-content">
                  <header className="app-header">
                    <h1>使用统计</h1>
                    <p>查看您的 Pomodoro 使用情况</p>
                  </header>
                  <main>
                    <Statistics />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <div className="app-content">
                  <header className="app-header">
                    <h1>个人资料</h1>
                    <p>查看和更新您的个人信息</p>
                  </header>
                  <main>
                    <Profile />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            {/* 404 页面 - 放在最后 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          <footer className="app-footer">
            <p>© {new Date().getFullYear()} Pomodoro 计时器</p>
          </footer>
        </div>
      </Router>
    </UserProvider>
  )
}

export default App
