// createUser.js
const mongoose = require('mongoose');
const User = require('./models/User'); // مسیر مدل User
require('dotenv').config(); // برای خواندن متغیرهای محیطی

// اتصال به دیتابیس
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/parsMakan');
    console.log('اتصال به دیتابیس برقرار شد');
  } catch (error) {
    console.error('خطا در اتصال به دیتابیس:', error);
    process.exit(1);
  }
};

const createUser = async () => {
  try {
    await connectDB();
    
    // پاک کردن کاربران موجود
    await User.deleteMany({});
    console.log('کاربران قبلی پاک شدند');
    
    // ایجاد کاربر جدید
    const user = new User({
      email: "alirezsbamdad7788@gmail.com",
      password: "252627", // خام - middleware هش می‌کند
      name: "ادمین اصلی",
      role: "super_admin",
      isActive: true
    });
    
    const savedUser = await user.save();
    console.log('کاربر با موفقیت ایجاد شد:', {
      id: savedUser._id,
      email: savedUser.email,
      name: savedUser.name,
      role: savedUser.role
    });
    
    // تست comparePassword
    const testPassword = await savedUser.comparePassword("252627");
    console.log('تست پسورد:', testPassword ? 'موفق' : 'ناموفق');
    
  } catch (error) {
    console.error('خطا در ایجاد کاربر:', error);
  } finally {
    await mongoose.connection.close();
    console.log('اتصال دیتابیس بسته شد');
  }
};

createUser();