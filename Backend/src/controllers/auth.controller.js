const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Shared cookie options — must match between set and clear
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

async function registerController(req, res) {
    const { fullname: { firstname, lastname }, email, password } = req.body;
    const isUserExist = await userModel.findOne({ email });
    if (isUserExist) {
        return res.status(400).json({ message: 'User already exists' });
    }
    if(password.trim().length < 5){
        return res.status(400).json({ message: 'Password must be at least 5 characters long' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); 

    const user = await userModel.create({
        fullname: { firstname, lastname },
        password: hashedPassword,
        email
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, COOKIE_OPTIONS);

    res.status(201).json({
        message: 'User registered successfully',
        user
    });
}

async function loginController(req, res) {
    const { email, password } = req.body;
    const isUserExist = await userModel.findOne({ email });
    if (!isUserExist) {
        return res.status(400).json({ message: 'User not exists' });
    }

    const isPasswordValid = await bcrypt.compare(password, isUserExist.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: isUserExist._id }, process.env.JWT_SECRET);
    res.cookie("token", token, COOKIE_OPTIONS);

    res.status(201).json({
        message: 'User logged in successfully',
    });
}

async function getMeController(req, res) {
    // req.user is set by authMiddleware
    return res.status(200).json({
        user: {
            _id: req.user._id,
            fullname: req.user.fullname,
            email: req.user.email,
        },
    });
}

async function getLogoutController(req, res) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
    });
    return res.status(200).json({ message: 'Logged out successfully' });
}

async function deleteAccountController(req, res) {
    // req.user is set by authMiddleware (route is now protected)
    await userModel.findByIdAndDelete(req.user._id);
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
    });
    return res.status(200).json({ message: 'Account deleted successfully' });
}

module.exports = {
    registerController,
    loginController,
    getMeController,
    getLogoutController,
    deleteAccountController
};