import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên'],
      trim: true,
      maxlength: [50, 'Tên không được quá 50 ký tự']
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Email không hợp lệ'
      ]
    },
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
      select: false // Không trả về password khi query
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
    },
    address: {
      street: String,
      city: String,
      district: String,
      ward: String,
      zipCode: String
    },
    avatar: {
      type: String,
      default: 'https://via.placeholder.com/150'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  {
    timestamps: true // Tự động thêm createdAt và updatedAt
  }
);

// Hash password trước khi save
userSchema.pre('save', async function (next) {
  // Chỉ hash nếu password được thay đổi
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method để so sánh password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method để loại bỏ sensitive data khi trả về JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
