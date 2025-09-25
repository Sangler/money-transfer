const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserInfoSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  username: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // which algorithm was used to hash this password (for painless migration)
  passwordAlgo: {
    type: String,
    default: 'argon2'
  },
  otp: String,
  otpExpiration: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },  
  phoneVerified: {
    type: Boolean,
    default: false
  },
  usedTime: {
    type: Number,
    default: 0
  },
  // ✅ Recommended additions
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  }, // to support role-based access
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// update updatedAt timestamp on each save
UserInfoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AUser', UserInfoSchema);
