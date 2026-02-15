const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email already exists'],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        trim: true,
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false,
    },
    systemGenerated: {
        type: Boolean,
        default: false,
        immutable: true,
        select: false,
    },
}, {
    timestamps: true,
})

// hash password before saving 
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
})
// compare password with hashed password in the database
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

const useModel = mongoose.model('User', userSchema);

module.exports = useModel;