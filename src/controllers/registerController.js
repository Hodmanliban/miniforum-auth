import User from "../models/User.js";

const registerController = async (req, res) => {
    try {
        const { email, name, password } = req.body;

        // Validering
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Kolla om användaren redan finns
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Skapa ny användare
        const user = new User({ email, name });
        await user.setPassword(password);
        await user.save();

        res.status(201).json({
            message: "User registered successfully",
            user: { id: user._id, email: user.email, name: user.name }
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export default registerController;
