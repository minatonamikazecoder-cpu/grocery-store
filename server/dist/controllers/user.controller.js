"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerification = exports.logout = exports.checkEmail = exports.googleLogin = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.createUser = exports.updatePassword = exports.verifyEmail = exports.resetPassword = exports.verifyOtp = exports.sendOtp = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const cloudinary_1 = require("../utils/cloudinary");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const data_source_1 = require("../db/data-source");
const User_1 = require("../models/User");
const Otp_1 = require("../models/Otp");
const typeorm_1 = require("typeorm");
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
// Email transporter for sending verification emails
const transporter = nodemailer_1.default.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
// Register a new user with email verification link
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { firstName, lastName, email, mobile, password, authType } = req.body;
    if (!firstName || !lastName || !email || !mobile || !password) {
        throw new ApiError_1.ApiError(400, "All fields are required");
    }
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    const existingUser = await userRepo.findOneBy({ email });
    if (existingUser) {
        throw new ApiError_1.ApiError(400, "User already exists");
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const newUser = userRepo.create({
        firstName,
        lastName,
        email,
        mobile,
        password: hashedPassword,
        authType: authType || "Email",
        status: "Inactive",
    });
    await userRepo.save(newUser);
    // Generate a verification token (JWT or UUID)
    const verificationToken = jsonwebtoken_1.default.sign({ email: newUser.email }, JWT_SECRET, { expiresIn: "1d" });
    // Construct verification link
    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    // Send verification email
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: newUser.email,
        subject: "Verify Your Email",
        text: `Hi ${firstName},\n\nThank you for registering. Please verify your email by clicking the following link:\n${verificationLink}\n\nThis link will expire in 24 hours.`
    });
    res.status(201).json(new ApiResponse_1.ApiResponse(201, null, "User registered successfully. Verification email sent.").toJSON());
});
// Login user
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    const user = await userRepo.findOneBy({ email });
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    // 🔒 Check if the account is Google-authenticated
    if (user.authType === "Google") {
        throw new ApiError_1.ApiError(400, "This account is connected with Google. Please log in using Google Sign-In.");
    }
    // ✅ Check password for Email-based auth
    if (user.authType === "Email") {
        if (!user.password)
            throw new ApiError_1.ApiError(401, "Invalid credentials");
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            throw new ApiError_1.ApiError(401, "Invalid credentials");
        if (user.status === "Inactive") {
            throw new ApiError_1.ApiError(404, "User account is inactive");
        }
        if (user.status === "Deleted") {
            throw new ApiError_1.ApiError(404, "User account is deleted, if want to recover contact admin");
        }
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "7d",
    });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        token,
        user: {
            ...userWithoutPassword,
            _id: user.id,
        }
    }, "Login successful").toJSON());
});
// Send OTP
exports.sendOtp = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    const user = await userRepo.findOneBy({ email });
    if (!user)
        throw new ApiError_1.ApiError(404, "Email not registered");
    const otpRepo = data_source_1.AppDataSource.getRepository(Otp_1.Otp);
    await otpRepo.delete({ email });
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newOtp = otpRepo.create({ email, otp: otpCode });
    await otpRepo.save(newOtp);
    await transporter.sendMail({
        to: email,
        subject: "Your OTP Code",
        html: `<h3>Your OTP is: ${otpCode}</h3><p>This code will expire in 5 minutes.</p>`,
    });
    res.status(200).json(new ApiResponse_1.ApiResponse(200, null, "OTP sent successfully").toJSON());
});
// Verify OTP
exports.verifyOtp = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, otp } = req.body;
    // OTP expires in 5 minutes (300 seconds)
    const expiryDate = new Date(Date.now() - 5 * 60 * 1000);
    const otpRepo = data_source_1.AppDataSource.getRepository(Otp_1.Otp);
    const validOtp = await otpRepo.findOne({
        where: {
            email,
            otp,
            createdAt: (0, typeorm_1.MoreThan)(expiryDate),
        }
    });
    if (!validOtp)
        throw new ApiError_1.ApiError(400, "Invalid or expired OTP");
    // Remove all OTPs after verification
    await otpRepo.delete({ email });
    res.status(200).json(new ApiResponse_1.ApiResponse(200, null, "OTP verified").toJSON());
});
// Reset Password
exports.resetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, newPassword } = req.body;
    const hashed = await bcryptjs_1.default.hash(newPassword, 10);
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    const user = await userRepo.findOneBy({ email });
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    user.password = hashed;
    await userRepo.save(user);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, null, "Password updated successfully").toJSON());
});
// Verify Email
exports.verifyEmail = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { token } = req.query;
    if (!token) {
        throw new ApiError_1.ApiError(400, "Verification token is required");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepo.findOneBy({ email: decoded.email });
        if (!user) {
            throw new ApiError_1.ApiError(404, "User not found");
        }
        if (user.status === "Active") {
            throw new ApiError_1.ApiError(400, "Email already verified");
        }
        user.status = "Active";
        await userRepo.save(user);
        res.status(200).json(new ApiResponse_1.ApiResponse(200, null, "Email verified successfully").toJSON());
    }
    catch (error) {
        throw new ApiError_1.ApiError(400, "Invalid or expired token");
    }
});
// Update password
exports.updatePassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    const user = await userRepo.findOneBy({ email });
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    if (!user.password)
        throw new ApiError_1.ApiError(400, "User has no password set");
    const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
    if (!isMatch)
        throw new ApiError_1.ApiError(400, "Current password is incorrect");
    const hashed = await bcryptjs_1.default.hash(newPassword, 10);
    user.password = hashed;
    await userRepo.save(user);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, null, "Password updated successfully").toJSON());
});
// Create User (Admin use case)
exports.createUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { firstName, lastName, email, mobile, password, authType } = req.body;
    let profilePictureUrl = null;
    if (req.file) {
        profilePictureUrl = await (0, cloudinary_1.uploadImage)(req.file.path, "profile_pictures");
    }
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    const existingUser = await userRepo.findOneBy({ email });
    if (existingUser)
        throw new ApiError_1.ApiError(400, "User already exists");
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const newUser = userRepo.create({
        firstName,
        lastName,
        email,
        mobile,
        password: hashedPassword,
        authType: authType || "Email",
        status: "Active",
        profilePicture: profilePictureUrl,
    });
    await userRepo.save(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(new ApiResponse_1.ApiResponse(201, {
        ...userWithoutPassword,
        _id: newUser.id,
    }, "User created successfully").toJSON());
});
// Get All Users with pagination (default page=1, limit=10)
exports.getAllUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    const [users, total] = await userRepo.findAndCount({
        where: {
            status: (0, typeorm_1.Not)("Deleted"),
            role: "User",
        },
        skip,
        take: limit,
    });
    const enrichedUsers = users.map((u) => {
        const { password: _, ...userWithoutPassword } = u;
        return {
            ...userWithoutPassword,
            _id: u.id,
        };
    });
    res.status(200).json(new ApiResponse_1.ApiResponse(200, enrichedUsers, "Users fetched successfully", {
        total,
        page,
        totalPages: Math.ceil(total / limit),
    }).toJSON());
});
// Get Single User
exports.getUserById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new ApiError_1.ApiError(401, "Unauthorized access");
    }
    if (req.user.id !== req.params.id && req.user.role !== 'Admin') {
        throw new ApiError_1.ApiError(403, "Unauthorized access");
    }
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    const user = await userRepo.findOneBy({ id: req.params.id });
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        ...userWithoutPassword,
        _id: user.id,
    }, "User fetched successfully").toJSON());
});
// Update User
exports.updateUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new ApiError_1.ApiError(401, "Unauthorized access");
    }
    if (req.user.id !== req.params.id && req.user.role !== 'Admin') {
        throw new ApiError_1.ApiError(403, "Unauthorized access");
    }
    const { firstName, lastName, mobile, status, password } = req.body;
    let { profilePicture } = req.body;
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    const user = await userRepo.findOneBy({ id: req.params.id });
    if (!user)
        throw new ApiError_1.ApiError(404, "User not found");
    if (req.file) {
        if (profilePicture) {
            const parts = profilePicture.split("/");
            const lastPart = parts.pop();
            if (lastPart) {
                const publicId = lastPart.split(".")[0];
                await (0, cloudinary_1.deleteImage)(publicId);
            }
        }
        profilePicture = await (0, cloudinary_1.uploadImage)(req.file.path, "profile_pictures");
    }
    if (firstName !== undefined)
        user.firstName = firstName;
    if (lastName !== undefined)
        user.lastName = lastName;
    if (mobile !== undefined)
        user.mobile = mobile;
    if (profilePicture !== undefined)
        user.profilePicture = profilePicture;
    if (status !== undefined)
        user.status = status;
    if (password) {
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(password, salt);
    }
    const updatedUser = await userRepo.save(user);
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        ...userWithoutPassword,
        _id: updatedUser.id,
    }, "User updated successfully").toJSON());
});
// Delete User
exports.deleteUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    const user = await userRepo.findOneBy({ id: req.params.id });
    if (!user) {
        throw new ApiError_1.ApiError(404, "User not found");
    }
    user.status = "Deleted";
    await userRepo.save(user);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, null, "User marked as deleted successfully").toJSON());
});
// POST /api/auth/google-login
exports.googleLogin = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, authType } = req.body;
    if (!email || !authType) {
        throw new ApiError_1.ApiError(400, "Email and authType are required");
    }
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    let user = await userRepo.findOneBy({ email });
    if (!user) {
        // New user → register
        const newUser = userRepo.create({
            email,
            authType, // Should be 'Google'
            status: "Active",
        });
        user = await userRepo.save(newUser);
        res.status(201).json(new ApiResponse_1.ApiResponse(201, {
            userId: user.id,
            email: user.email,
            isNewUser: true,
        }, "User registered successfully").toJSON());
    }
    else {
        // Existing user → login
        res.status(200).json(new ApiResponse_1.ApiResponse(200, {
            userId: user.id,
            email: user.email,
            isNewUser: false,
        }, "Login successful").toJSON());
    }
});
// Check Email
exports.checkEmail = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError_1.ApiError(400, "Email is required");
    }
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    const user = await userRepo.findOneBy({ email, authType: "Email" });
    res.status(200).json(new ApiResponse_1.ApiResponse(200, { exists: !!user }, "Email check completed").toJSON());
});
// Logout user
exports.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.status(200).json(new ApiResponse_1.ApiResponse(200, null, "Logged out successfully").toJSON());
});
// Resend verification email
exports.resendVerification = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError_1.ApiError(400, "Email is required");
    }
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    const user = await userRepo.findOneBy({ email });
    if (!user) {
        throw new ApiError_1.ApiError(404, "User not found");
    }
    if (user.status === "Active") {
        throw new ApiError_1.ApiError(400, "Email already verified");
    }
    // Generate a verification token
    const verificationToken = jsonwebtoken_1.default.sign({ email: user.email }, JWT_SECRET, { expiresIn: "1d" });
    // Construct verification link
    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    // Send verification email
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Verify Your Email",
        text: `Hi ${user.firstName || 'there'},\n\nPlease verify your email by clicking the following link:\n${verificationLink}\n\nThis link will expire in 24 hours.`
    });
    res.status(200).json(new ApiResponse_1.ApiResponse(200, null, "Verification email resent successfully").toJSON());
});
