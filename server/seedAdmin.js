const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // اتصال به دیتابیس
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/company-website');
    console.log('✅ Connected to MongoDB');

    // چک کن ادمین قبلا وجود داره یا نه
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@company.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    // ساخت ادمین جدید
    const adminUser = new User({
      name: 'مدیر سیستم',
      email: process.env.ADMIN_EMAIL || 'admin@company.com',
      password: process.env.ADMIN_PASSWORD || 'admin123456',
      role: 'super_admin'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password:', process.env.ADMIN_PASSWORD || 'admin123456');
    console.log('👤 Role:', adminUser.role);

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    mongoose.disconnect();
  }
};

createAdmin();