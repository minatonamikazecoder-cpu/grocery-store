const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { uploadImage, deleteImage } = require("../utils/cloudinary");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const JWT_SECRET = process.env.JWT_SECRET;
const Otp = require("../models/Otp");

// Email transporter for sending verification emails
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Register a new user with email verification link
const register = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, mobile, password, authType } = req.body;

    if (!firstName || !lastName || !email || !mobile || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        firstName,
        lastName,
        email,
        mobile,
        password: hashedPassword,
        authType: authType || "Email",
        status: "Inactive",
    });

    await newUser.save();

    // Generate a verification token (JWT or UUID)
    const verificationToken = jwt.sign({ email: newUser.email }, JWT_SECRET, { expiresIn: "1d" });

    // Construct verification link
    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    // Send verification email
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: newUser.email,
        subject: "Verify Your Email",
        text: `Hi ${firstName},\n\nThank you for registering. Please verify your email by clicking the following link:\n${verificationLink}\n\nThis link will expire in 24 hours.`
    });

    res.status(201).json({ message: "User registered successfully. Verification email sent." });
});

// Login user
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");

    // 🔒 Check if the account is Google-authenticated
    if (user.authType === "Google") {
        throw new ApiError(400, "This account is connected with Google. Please log in using Google Sign-In.");
    }

    // ✅ Check password for Email-based auth
    if (user.authType === "Email") {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new ApiError(401, "Invalid credentials");
        if (user.status === "Inactive") {
            throw new ApiError(404, "User account is inactive");
        }
        if (user.status === "Deleted") {
            throw new ApiError(404, "User account is deleted, if want to recover contact admin");
        }
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
        expiresIn: "7d",
    });

    res.json({ token, user });
});

// Send OTP
const sendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "Email not registered");

    await Otp.deleteMany({ email });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({ email, otp: otpCode });

    await transporter.sendMail({
        to: email,
        subject: "Your OTP Code",
        html: `<h3>Your OTP is: ${otpCode}</h3><p>This code will expire in 5 minutes.</p>`,
    });

    res.status(200).json({ message: "OTP sent successfully" });
});

const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) throw new ApiError(400, "Invalid or expired OTP");

    // You can now proceed to password reset
    await Otp.deleteMany({ email }); // Remove all OTPs after verification
    res.status(200).json({ message: "OTP verified" });
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
    const { email, newPassword } = req.body;
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashed });
    res.json({ message: "Password updated successfully" });
});

// Verify Email
const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;
    if (!token) {
        throw new ApiError(400, "Verification token is required");
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.status === "Active") {
        throw new ApiError(400, "Email already verified");
    }

    user.status = "Active";
    await user.save();

    res.json({ message: "Email verified successfully" });
});

//update password
const updatePassword = asyncHandler(async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new ApiError(400, "Current password is incorrect");

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashed });
    res.json({ message: "Password updated successfully" });
});

// Create User (Admin use case)
const createUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, mobile, password, authType, firebaseUid } = req.body;

    let profilePictureUrl = null;
    if (req.file) {
        profilePictureUrl = await uploadImage(req.file.path, "profile_pictures");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new ApiError(400, "User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        firstName,
        lastName,
        email,
        mobile,
        password: hashedPassword,
        authType,
        firebaseUid,
        status: "Active",
        profilePicture: profilePictureUrl,
    });

    await newUser.save();
    res.status(201).json(newUser);
});

// Get All Users
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ status: { $ne: "Deleted" }, role: "User" });
    res.json(users);
});

// Get Single User
const getUserById = asyncHandler(async (req, res) => {
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'Admin') {
        throw new ApiError(403, "Unauthorized access");
    }
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");
    res.json(user);
});

const updateUser = asyncHandler(async (req, res) => {
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'Admin') {
        throw new ApiError(403, "Unauthorized access");
    }
    const { firstName, lastName, mobile, status, password } = req.body;
    let { profilePicture } = req.body;

    if (req.file) {
        if (profilePicture) {
            const publicId = profilePicture.split("/").pop().split(".")[0];
            await deleteImage(publicId);
        }
        profilePicture = await uploadImage(req.file.path, "profile_pictures");
    }

    if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const updateFields = { firstName, lastName, mobile, profilePicture, status, password: hashedPassword };
        const user = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true });
        return res.json(user);
    }

    const updateFieldsWithoutPassword = { firstName, lastName, mobile, profilePicture, status };
    const user = await User.findByIdAndUpdate(req.params.id, updateFieldsWithoutPassword, { new: true });
    res.json(user);
});

// Delete User
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { status: "Deleted" },
        { new: true }
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.json({ message: "User marked as deleted successfully" });
});

// POST /api/auth/google-login
const googleLogin = asyncHandler(async (req, res) => {
    const { email, authType } = req.body;

    if (!email || !authType) {
        throw new ApiError(400, "Email and authType are required");
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
        // New user → register
        user = await User.create({
            email,
            authType, // Should be 'google'
            status: "Active",
        });

        return res.status(201).json({
            message: "User registered successfully",
            userId: user._id,
            email: user.email,
            isNewUser: true,
        });
    }
    else {
        // Existing user → login
        return res.status(200).json({
            message: "Login successful",
            userId: user._id,
            email: user.email,
            isNewUser: false,
        });
    }
});

const checkEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email, authType: "Email" });

    if (user) {
        return res.status(200).json({ exists: true });
    } else {
        return res.status(200).json({ exists: false });
    }
});

module.exports = {
    register,
    login,
    sendOtp,
    verifyOtp,
    resetPassword,
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    verifyEmail,
    updatePassword,
    googleLogin,
    checkEmail
};
