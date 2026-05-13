const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation.js");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;
    
    // Normalize email
    const normalizedEmail = emailId.toLowerCase().trim();

    const existingUser = await User.findOne({ emailId: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered. Please login.",
      });
    }

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // create user
    const user = new User({
      firstName,
      lastName,
      emailId: normalizedEmail,
      password: passwordHash,
    });

    const savedUser = await user.save();
    console.log(`User created: ${normalizedEmail}`);

    // generate jwt
    const token = await savedUser.getJWT();

    // set cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // Use false for localhost, true in production with HTTPS
      maxAge: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    });

    // send response
    res.status(201).json({
      success: true,
      message: "User Added Successfully!",
      data: savedUser,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(400).json({ 
      success: false, 
      message: "Error saving the user: " + error.message 
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    
    // Validate inputs
    if (!emailId || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    // Trim whitespace from email
    const trimmedEmail = emailId.toLowerCase().trim();
    const trimmedPassword = password.trim();
    
    const user = await User.findOne({ emailId: trimmedEmail });
    if (!user) {
      console.log(`User not found for email: ${trimmedEmail}`);
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    
    console.log(`User found: ${user.firstName}, attempting password validation...`);
    
    const isPasswordValid = await user.validatePassword(trimmedPassword);
    console.log(`Password validation result: ${isPasswordValid}`);
    
    if (!isPasswordValid) {
      console.log(`Password validation failed for user: ${trimmedEmail}`);
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    
    const token = await user.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 8 * 60 * 60 * 1000,
    });
    
    res.json({ 
      success: true, 
      message: "Login successful",
      data: user 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ message: "ERROR: " + error.message });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: "lax",
      secure: false,
    });

    res.send("Logout Successful");
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

module.exports = authRouter;
