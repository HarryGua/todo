// 计时器 Service Worker
let timers = {};

// 接收消息
self.addEventListener('message', (event) => {
  const { action, timerId, duration, timestamp } = event.data;
  
  switch (action) {
    case 'START_TIMER':
      timers[timerId] = {
        duration,
        startTime: timestamp,
        intervalId: setInterval(() => {
          const elapsedTime = Math.floor((Date.now() - timers[timerId].startTime) / 1000);
          
          if (elapsedTime >= duration) {
            clearInterval(timers[timerId].intervalId);
            delete timers[timerId];
            
            // 通知主线程计时结束
            self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({
                  action: 'TIMER_COMPLETE',
                  timerId
                });
              });
            });
          }
        }, 1000)
      };
      break;
      
    case 'PAUSE_TIMER':
      if (timers[timerId]) {
        clearInterval(timers[timerId].intervalId);
        // 保存已经过去的时间
        timers[timerId].elapsedTime = Math.floor((Date.now() - timers[timerId].startTime) / 1000);
        timers[timerId].isPaused = true;
      }
      break;
      
    case 'RESUME_TIMER':
      if (timers[timerId] && timers[timerId].isPaused) {
        // 调整开始时间，考虑已经过去的时间
        timers[timerId].startTime = Date.now() - (timers[timerId].elapsedTime * 1000);
        timers[timerId].isPaused = false;
        
        timers[timerId].intervalId = setInterval(() => {
          const elapsedTime = Math.floor((Date.now() - timers[timerId].startTime) / 1000);
          
          if (elapsedTime >= timers[timerId].duration) {
            clearInterval(timers[timerId].intervalId);
            delete timers[timerId];
            
            // 通知主线程计时结束
            self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({
                  action: 'TIMER_COMPLETE',
                  timerId
                });
              });
            });
          }
        }, 1000);
      }
      break;
      
    case 'STOP_TIMER':
      if (timers[timerId]) {
        clearInterval(timers[timerId].intervalId);
        delete timers[timerId];
      }
      break;
      
    case 'GET_REMAINING_TIME':
      if (timers[timerId]) {
        const elapsedTime = timers[timerId].isPaused 
          ? timers[timerId].elapsedTime 
          : Math.floor((Date.now() - timers[timerId].startTime) / 1000);
        
        const remainingTime = Math.max(0, timers[timerId].duration - elapsedTime);
        
        // 回复请求
        event.ports[0].postMessage({
          remainingTime
        });
      } else {
        event.ports[0].postMessage({
          remainingTime: 0
        });
      }
      break;
  }
}); 