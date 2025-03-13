const mongoose = require('mongoose');

const pomodoroSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['pomodoro', 'shortBreak', 'longBreak'],
    required: true
  },
  duration: {
    type: Number, // 以分钟为单位
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  completed: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const Pomodoro = mongoose.model('Pomodoro', pomodoroSchema);

module.exports = Pomodoro; 