const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
const User = require("../models/User");

// Load backend .env configuration
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Error: MONGODB_URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB Database (purebite)...");
    await mongoose.connect(`${uri}/purebite`);
    console.log("Database connected successfully.");

    // Define default seed accounts
    const seedAccounts = [
      {
        firstName: "Admin",
        lastName: "PureBite",
        email: "admin@purebite.com",
        mobile: "1234567890",
        password: "Admin123",
        role: "Admin",
        status: "Active",
        authType: "Email"
      },
      {
        firstName: "User",
        lastName: "PureBite",
        email: "user@purebite.com",
        mobile: "9876543210",
        password: "User123",
        role: "User",
        status: "Active",
        authType: "Email"
      }
    ];

    for (const account of seedAccounts) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: account.email });
      if (existingUser) {
        console.log(`User already exists: ${account.email}. Updating password/role.`);
        
        // Hash password and update
        const hashedPassword = await bcrypt.hash(account.password, 10);
        existingUser.password = hashedPassword;
        existingUser.role = account.role;
        existingUser.status = account.status;
        existingUser.authType = account.authType;
        await existingUser.save();
      } else {
        console.log(`Creating user: ${account.email}`);
        
        // Hash password and save
        const hashedPassword = await bcrypt.hash(account.password, 10);
        const newUser = new User({
          ...account,
          password: hashedPassword
        });
        await newUser.save();
      }
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Database seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
  }
}

seedDatabase();
