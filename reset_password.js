const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/user.model');

const resetPassword = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const email = 'ankushpayal58@gmail.com';
        const newPassword = 'Duggu@Doggy@12ap';

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        console.log(`Updating password for ${email}...`);

        // The pre-save hook in user.model.js will hash the password
        user.passwordHash = newPassword;
        await user.save();

        console.log('Password updated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting password:', error);
        process.exit(1);
    }
};

resetPassword();
