const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名是必填项'],
    trim: true,
    minlength: [3, '用户名至少需要3个字符'],
    unique: true
  },
  email: {
    type: String,
    required: [true, '邮箱是必填项'],
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, '请输入有效的邮箱地址']
  },
  password: {
    type: String,
    required: [true, '密码是必填项'],
    minlength: [6, '密码至少需要6个字符']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// 在保存用户之前对密码进行哈希处理
userSchema.pre('save', async function(next) {
  // 只有在密码被修改时才重新哈希
  if (!this.isModified('password')) return next();
  
  try {
    // 生成盐值
    const salt = await bcrypt.genSalt(10);
    // 哈希密码
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码的方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 