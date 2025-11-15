const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users',
      'manage_mentors',
      'manage_categories',
      'view_analytics',
      'manage_billing',
      'handle_reports',
      'system_settings',
      'all'
    ]
  }],
  activityLog: [{
    action: String,
    targetType: String,
    targetId: mongoose.Schema.Types.ObjectId,
    description: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  lastActive: Date
});

adminSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes('all') || this.permissions.includes(permission);
};

adminSchema.methods.logActivity = async function(action, targetType, targetId, description) {
  this.activityLog.push({ action, targetType, targetId, description });
  this.lastActive = new Date();
  await this.save();
};

module.exports = mongoose.model('Admin', adminSchema);
