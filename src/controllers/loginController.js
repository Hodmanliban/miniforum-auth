import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, COOKIE_OPTIONS } from "../config/config.js";

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        user.lastLoginAt = new Date();
        await user.save();

        const token = jwt.sign(
            { id: user._id },
            ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie("accessToken", token, COOKIE_OPTIONS);

        res.status(200).json({
            message: "Login successful",
            user: user.toPublicJSON()
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export default loginController;