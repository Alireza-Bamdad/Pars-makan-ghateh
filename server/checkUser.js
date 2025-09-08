const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/company-website');
    console.log('✅ Connected to MongoDB');

    // تمام کاربران رو بگیر
    const users = await User.find({});
    console.log('📊 Total users:', users.length);
    
    if (users.length === 0) {
      console.log('⚠️  No users found in database!');
    } else {
      users.forEach(user => {
        console.log('👤 User:', {
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          id: user._id
        });
      });
    }

    // تست رمز عبور
    const testEmail = process.env.ADMIN_EMAIL || 'admin@company.com';
    const testPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    
    const user = await User.findOne({ email: testEmail });
    if (user) {
      console.log('\n🔍 Testing password for:', testEmail);
      const isValid = await user.comparePassword(testPassword);
      console.log('🔑 Password valid:', isValid);
      
      if (!isValid) {
        console.log('❌ Password comparison failed!');
        console.log('💡 Let me create a new admin with correct password...');
        
        // حذف کاربر قدیمی و ساخت جدید
        await User.deleteOne({ email: testEmail });
        
        const newAdmin = new User({
          name: 'مدیر سیستم',
          email: testEmail,
          password: testPassword,
          role: 'super_admin'
        });
        
        await newAdmin.save();
        console.log('✅ New admin created successfully!');
      }
    } else {
      console.log('❌ User not found:', testEmail);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
  }
};

checkUsers();