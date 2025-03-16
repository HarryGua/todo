import { useState, useEffect, useRef } from 'react';
import '../styles/Timer.css';
import { pomodoroAPI } from '../services/api';

function Timer() {
  // 定义不同模式的时间（以秒为单位）
  const POMODORO_TIME = 25 * 60;
  const SHORT_BREAK_TIME = 5 * 60;
  const LONG_BREAK_TIME = 15 * 60;

  // 从本地存储加载设置和历史记录
  const loadFromLocalStorage = () => {
    try {
      // 加载设置
      const savedSettings = localStorage.getItem('pomodoroSettings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (e) {
      console.error('加载设置失败:', e);
    }
    
    // 返回默认设置
    return {
      pomodoroTime: POMODORO_TIME,
      shortBreakTime: SHORT_BREAK_TIME,
      longBreakTime: LONG_BREAK_TIME,
      cycles: 0,
      history: []
    };
  };

  // 获取初始设置
  const initialSettings = loadFromLocalStorage();

  // 状态
  const [timeLeft, setTimeLeft] = useState(initialSettings.pomodoroTime);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('pomodoro'); // 'pomodoro', 'shortBreak', 'longBreak'
  const [cycles, setCycles] = useState(initialSettings.cycles); // 完成的番茄钟次数
  const [progress, setProgress] = useState(100); // 进度条百分比
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [history, setHistory] = useState(initialSettings.history || []); // 历史记录
  const [showSettings, setShowSettings] = useState(false); // 是否显示设置面板
  const [customTimes, setCustomTimes] = useState({
    pomodoro: initialSettings.pomodoroTime / 60,
    shortBreak: initialSettings.shortBreakTime / 60,
    longBreak: initialSettings.longBreakTime / 60
  });
  const [apiError, setApiError] = useState('');
  
  // 新增状态和引用
  const [lastActiveTime, setLastActiveTime] = useState(null);
  const timerInterval = useRef(null);
  const [swRegistration, setSwRegistration] = useState(null);
  const timerId = useRef(`timer-${Date.now()}`);

  // 引用当前模式的总时间
  const totalTimeRef = useRef(initialSettings.pomodoroTime);
  
  // 保存设置到本地存储
  const saveToLocalStorage = () => {
    try {
      const settings = {
        pomodoroTime: customTimes.pomodoro * 60,
        shortBreakTime: customTimes.shortBreak * 60,
        longBreakTime: customTimes.longBreak * 60,
        cycles,
        history
      };
      
      localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    } catch (e) {
      console.error('保存设置失败:', e);
    }
  };
  
  // 保存计时器状态到 localStorage
  const saveTimerState = (currentTime = null) => {
    const state = {
      isRunning,
      mode,
      timeLeft,
      progress,
      lastActiveTime: currentTime || lastActiveTime,
      totalTime: totalTimeRef.current
    };
    localStorage.setItem('timerState', JSON.stringify(state));
  };

  // 添加历史记录
  const addHistoryEntry = async (type) => {
    const newEntry = {
      type,
      date: new Date().toISOString(),
      duration: type === 'pomodoro' ? customTimes.pomodoro : 
                type === 'shortBreak' ? customTimes.shortBreak : customTimes.longBreak
    };
    
    // 添加到本地历史记录
    setHistory(prevHistory => [...prevHistory, newEntry]);
    
    // 保存到后端
    try {
      await pomodoroAPI.create({
        type,
        duration: newEntry.duration,
        notes: ''
      });
    } catch (error) {
      console.error('保存 Pomodoro 记录失败:', error);
      setApiError('保存记录失败，但您可以继续使用应用');
      
      // 3秒后清除错误消息
      setTimeout(() => {
        setApiError('');
      }, 3000);
    }
  };

  // 清除历史记录
  const clearHistory = async () => {
    setHistory([]);
    setCycles(0);
    
    // 从后端清除记录
    try {
      await pomodoroAPI.clearAll();
    } catch (error) {
      console.error('清除 Pomodoro 记录失败:', error);
      setApiError('清除记录失败，请稍后再试');
      
      // 3秒后清除错误消息
      setTimeout(() => {
        setApiError('');
      }, 3000);
    }
  };

  // 请求通知权限
  const requestNotificationPermission = () => {
    if (!("Notification" in window)) {
      alert("此浏览器不支持桌面通知");
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        setNotificationsEnabled(true);
      }
    });
  };

  // 发送通知
  const sendNotification = (title, body) => {
    if (notificationsEnabled && Notification.permission === "granted") {
      new Notification(title, {
        body: body,
        icon: '/favicon.ico'
      });
    }
  };

  // 播放提示音
  const playAlertSound = () => {
    try {
      // 尝试加载并播放通知音效
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(e => {
        console.error("播放音频文件失败:", e);
        // 回退到生成音频
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.5;
        
        oscillator.start();
        
        // 0.1秒后停止
        setTimeout(() => {
          oscillator.stop();
          // 播放第二个音调
          const oscillator2 = audioContext.createOscillator();
          oscillator2.connect(gainNode);
          oscillator2.type = 'sine';
          oscillator2.frequency.value = 600;
          oscillator2.start();
          
          // 0.1秒后停止
          setTimeout(() => {
            oscillator2.stop();
          }, 100);
        }, 100);
      });
    } catch (e) {
      console.error("播放音频失败:", e);
    }
  };

  // 格式化时间为 MM:SS 格式
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 切换模式
  const switchMode = (newMode) => {
    // 如果有 Service Worker 正在运行计时器，停止它
    if (swRegistration && isRunning) {
      swRegistration.active.postMessage({
        action: 'STOP_TIMER',
        timerId: timerId.current
      });
    }
    
    setIsRunning(false);
    setMode(newMode);
    
    let newTime;
    switch(newMode) {
      case 'pomodoro':
        newTime = customTimes.pomodoro * 60;
        break;
      case 'shortBreak':
        newTime = customTimes.shortBreak * 60;
        break;
      case 'longBreak':
        newTime = customTimes.longBreak * 60;
        break;
      default:
        newTime = customTimes.pomodoro * 60;
    }
    
    setTimeLeft(newTime);
    totalTimeRef.current = newTime;
    setProgress(100); // 重置进度条
    
    // 保存状态变化
    setTimeout(() => saveTimerState(), 0);
  };

  // 开始计时器
  const startTimer = () => {
    setIsRunning(true);
    setLastActiveTime(Date.now());
    
    // 使用 Service Worker 进行计时（如果可用）
    if (swRegistration) {
      swRegistration.active.postMessage({
        action: 'START_TIMER',
        timerId: timerId.current,
        duration: timeLeft,
        timestamp: Date.now()
      });
    }
    
    // 保存状态变化
    setTimeout(() => saveTimerState(Date.now()), 0);
  };

  // 暂停计时器
  const pauseTimer = () => {
    setIsRunning(false);
    setLastActiveTime(null);
    
    // 如果有 Service Worker 正在运行计时器，暂停它
    if (swRegistration) {
      swRegistration.active.postMessage({
        action: 'PAUSE_TIMER',
        timerId: timerId.current
      });
    }
    
    // 保存状态变化
    setTimeout(() => saveTimerState(), 0);
  };

  // 重置计时器
  const resetTimer = () => {
    setIsRunning(false);
    setLastActiveTime(null);
    
    // 如果有 Service Worker 正在运行计时器，停止它
    if (swRegistration) {
      swRegistration.active.postMessage({
        action: 'STOP_TIMER',
        timerId: timerId.current
      });
    }
    
    let newTime;
    switch(mode) {
      case 'pomodoro':
        newTime = customTimes.pomodoro * 60;
        break;
      case 'shortBreak':
        newTime = customTimes.shortBreak * 60;
        break;
      case 'longBreak':
        newTime = customTimes.longBreak * 60;
        break;
      default:
        newTime = customTimes.pomodoro * 60;
    }
    
    setTimeLeft(newTime);
    setProgress(100); // 重置进度条
    
    // 保存状态变化
    setTimeout(() => saveTimerState(), 0);
  };

  // 处理计时结束
  const handleTimerComplete = () => {
    // 播放提示音
    playAlertSound();
    
    if (mode === 'pomodoro') {
      // 增加完成的番茄钟次数
      const newCycles = cycles + 1;
      setCycles(newCycles);
      
      // 添加历史记录
      addHistoryEntry('pomodoro');
      
      // 发送通知
      sendNotification(
        "专注时间结束！", 
        `你已完成 ${newCycles} 个番茄钟，现在是休息时间。`
      );
      
      // 每 4 个番茄钟后进入长休息，否则进入短休息
      if (newCycles % 4 === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
    } else {
      // 添加历史记录
      addHistoryEntry(mode);
      
      // 如果是休息结束，回到番茄钟模式
      sendNotification(
        "休息时间结束！", 
        "现在开始新的专注时间。"
      );
      switchMode('pomodoro');
    }
    
    // 保存状态变化
    setTimeout(() => saveTimerState(), 0);
  };

  // 更新自定义时间
  const handleCustomTimeChange = (type, value) => {
    // 确保值在合理范围内
    const newValue = Math.max(1, Math.min(60, parseInt(value) || 1));
    
    setCustomTimes(prev => ({
      ...prev,
      [type]: newValue
    }));
  };

  // 应用自定义时间设置
  const applyCustomTimes = () => {
    // 如果当前模式的时间被修改，则更新计时器
    let newTime;
    switch(mode) {
      case 'pomodoro':
        newTime = customTimes.pomodoro * 60;
        break;
      case 'shortBreak':
        newTime = customTimes.shortBreak * 60;
        break;
      case 'longBreak':
        newTime = customTimes.longBreak * 60;
        break;
      default:
        newTime = customTimes.pomodoro * 60;
    }
    
    setTimeLeft(newTime);
    totalTimeRef.current = newTime;
    setProgress(100);
    
    // 隐藏设置面板
    setShowSettings(false);
    
    // 保存状态变化
    setTimeout(() => saveTimerState(), 0);
  };
  
  // 处理页面可见性变化
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      // 页面隐藏时保存当前时间
      if (isRunning) {
        setLastActiveTime(Date.now());
        saveTimerState(Date.now());
      }
    } else {
      // 页面可见时恢复计时
      if (isRunning && lastActiveTime) {
        // 如果使用 Service Worker，从 Service Worker 获取剩余时间
        if (swRegistration) {
          const messageChannel = new MessageChannel();
          messageChannel.port1.onmessage = (event) => {
            const { remainingTime } = event.data;
            if (remainingTime <= 0) {
              handleTimerComplete();
            } else {
              setTimeLeft(remainingTime);
              setProgress((remainingTime / totalTimeRef.current) * 100);
            }
          };
          
          swRegistration.active.postMessage({
            action: 'GET_REMAINING_TIME',
            timerId: timerId.current
          }, [messageChannel.port2]);
        } else {
          // 否则使用本地时间计算
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - lastActiveTime) / 1000);
          
          if (elapsedSeconds >= timeLeft) {
            // 计时结束
            handleTimerComplete();
          } else {
            // 更新剩余时间
            setTimeLeft(prevTime => Math.max(0, prevTime - elapsedSeconds));
            // 更新进度条
            const newProgress = ((timeLeft - elapsedSeconds) / totalTimeRef.current) * 100;
            setProgress(Math.max(0, newProgress));
            // 更新最后活动时间
            setLastActiveTime(now);
          }
        }
      }
    }
  };

  // 初始化时从 localStorage 加载状态
  useEffect(() => {
    // 初始化 Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        setSwRegistration(registration);
        
        // 监听来自 Service Worker 的消息
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data.action === 'TIMER_COMPLETE' && event.data.timerId === timerId.current) {
            handleTimerComplete();
          }
        });
      });
    }
    
    // 加载保存的计时器状态
    const savedTimerState = JSON.parse(localStorage.getItem('timerState'));
    if (savedTimerState) {
      // 如果计时器正在运行，计算离开后经过的时间
      if (savedTimerState.isRunning && savedTimerState.lastActiveTime) {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - savedTimerState.lastActiveTime) / 1000);
        
        // 如果计时器应该已经结束
        if (elapsedSeconds >= savedTimerState.timeLeft) {
          // 添加一条完成的记录
          if (savedTimerState.mode === 'pomodoro') {
            // 增加完成的番茄钟次数
            setCycles(prevCycles => prevCycles + 1);
            
            // 添加历史记录
            addHistoryEntry('pomodoro');
          } else {
            // 添加休息记录
            addHistoryEntry(savedTimerState.mode);
          }
          
          // 重置计时器状态
          setIsRunning(false);
          setMode(savedTimerState.mode === 'pomodoro' ? 
            (cycles % 4 === 3 ? 'longBreak' : 'shortBreak') : 
            'pomodoro');
          
          // 设置新模式的时间
          const newMode = savedTimerState.mode === 'pomodoro' ? 
            (cycles % 4 === 3 ? 'longBreak' : 'shortBreak') : 
            'pomodoro';
          
          let newTime;
          switch(newMode) {
            case 'pomodoro':
              newTime = customTimes.pomodoro * 60;
              break;
            case 'shortBreak':
              newTime = customTimes.shortBreak * 60;
              break;
            case 'longBreak':
              newTime = customTimes.longBreak * 60;
              break;
            default:
              newTime = customTimes.pomodoro * 60;
          }
          
          setTimeLeft(newTime);
          totalTimeRef.current = newTime;
          setProgress(100);
        } else {
          // 继续计时，减去已经过去的时间
          setIsRunning(savedTimerState.isRunning);
          setMode(savedTimerState.mode);
          setTimeLeft(savedTimerState.timeLeft - elapsedSeconds);
          setLastActiveTime(now);
          totalTimeRef.current = savedTimerState.totalTime;
          
          // 更新进度条
          const newProgress = ((savedTimerState.timeLeft - elapsedSeconds) / savedTimerState.totalTime) * 100;
          setProgress(Math.max(0, newProgress));
        }
      } else {
        // 恢复保存的状态
        setIsRunning(savedTimerState.isRunning);
        setMode(savedTimerState.mode);
        setTimeLeft(savedTimerState.timeLeft);
        setProgress(savedTimerState.progress);
        totalTimeRef.current = savedTimerState.totalTime;
      }
    }
    
    // 添加页面可见性变化事件监听
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(timerInterval.current);
      
      // 如果有 Service Worker 正在运行计时器，停止它
      if (swRegistration && isRunning) {
        swRegistration.active.postMessage({
          action: 'STOP_TIMER',
          timerId: timerId.current
        });
      }
    };
  }, []);

  // 使用 useEffect 处理计时器逻辑
  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      // 如果没有使用 Service Worker，使用本地计时器
      if (!swRegistration) {
        interval = setInterval(() => {
          setTimeLeft((prevTime) => {
            const newTime = prevTime - 1;
            // 更新进度条
            setProgress((newTime / totalTimeRef.current) * 100);
            return newTime;
          });
        }, 1000);
        
        timerInterval.current = interval;
      }
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, swRegistration]);

  // 检查通知权限
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }
  }, []);

  // 当设置或历史记录变化时，保存到本地存储
  useEffect(() => {
    saveToLocalStorage();
  }, [cycles, history, customTimes]);
  
  // 当计时器状态变化时，保存到本地存储
  useEffect(() => {
    if (isRunning || timeLeft !== totalTimeRef.current) {
      saveTimerState();
    }
  }, [isRunning, timeLeft, mode, progress]);

  return (
    <div className="timer-container">
      {apiError && <div className="api-error">{apiError}</div>}
      
      <div className="timer-modes">
        <button 
          className={`mode-button ${mode === 'pomodoro' ? 'active' : ''}`} 
          onClick={() => switchMode('pomodoro')}
        >
          专注
        </button>
        <button 
          className={`mode-button ${mode === 'shortBreak' ? 'active' : ''}`} 
          onClick={() => switchMode('shortBreak')}
        >
          短休息
        </button>
        <button 
          className={`mode-button ${mode === 'longBreak' ? 'active' : ''}`} 
          onClick={() => switchMode('longBreak')}
        >
          长休息
        </button>
      </div>
      
      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="timer-display">{formatTime(timeLeft)}</div>
      
      <div className="timer-controls">
        {!isRunning ? (
          <button className="timer-button start" onClick={startTimer}>开始</button>
        ) : (
          <button className="timer-button pause" onClick={pauseTimer}>暂停</button>
        )}
        <button className="timer-button reset" onClick={resetTimer}>重置</button>
      </div>
      
      <div className="timer-actions">
        {!notificationsEnabled && (
          <button 
            className="action-button" 
            onClick={requestNotificationPermission}
          >
            启用通知
          </button>
        )}
        <button 
          className="action-button" 
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings ? '隐藏设置' : '显示设置'}
        </button>
      </div>
      
      {showSettings && (
        <div className="settings-panel">
          <h3>自定义时间（分钟）</h3>
          <div className="settings-controls">
            <div className="setting-item">
              <label>专注时间:</label>
              <input 
                type="number" 
                min="1" 
                max="60" 
                value={customTimes.pomodoro} 
                onChange={(e) => handleCustomTimeChange('pomodoro', e.target.value)}
              />
            </div>
            <div className="setting-item">
              <label>短休息时间:</label>
              <input 
                type="number" 
                min="1" 
                max="60" 
                value={customTimes.shortBreak} 
                onChange={(e) => handleCustomTimeChange('shortBreak', e.target.value)}
              />
            </div>
            <div className="setting-item">
              <label>长休息时间:</label>
              <input 
                type="number" 
                min="1" 
                max="60" 
                value={customTimes.longBreak} 
                onChange={(e) => handleCustomTimeChange('longBreak', e.target.value)}
              />
            </div>
          </div>
          <div className="settings-actions">
            <button className="apply-button" onClick={applyCustomTimes}>应用设置</button>
            <button className="clear-button" onClick={clearHistory}>清除历史记录</button>
          </div>
        </div>
      )}
      
      <div className="timer-info">
        <p>已完成番茄钟: {cycles}</p>
        <p>当前模式: {
          mode === 'pomodoro' ? '专注工作' : 
          mode === 'shortBreak' ? '短休息' : '长休息'
        }</p>
      </div>
      
      {history.length > 0 && (
        <div className="history-summary">
          <h3>统计信息</h3>
          <p>今日完成番茄钟: {
            history.filter(entry => 
              entry.type === 'pomodoro' && 
              new Date(entry.date).toDateString() === new Date().toDateString()
            ).length
          }</p>
          <p>总专注时间: {
            Math.round(history
              .filter(entry => entry.type === 'pomodoro')
              .reduce((total, entry) => total + entry.duration, 0)
            )} 分钟
          </p>
        </div>
      )}
    </div>
  );
}

export default Timer; 