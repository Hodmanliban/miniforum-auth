import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4100;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Basroute
app.get("/", (req, res) => {
    res.send("Auth API up ✅");
});

// DB-anslutning
mongoose.connect(process.env.DB_URL, { dbName: process.env.DB_NAME || "auth" })
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ DB error:", err.message));

app.listen(PORT, () => console.log(`🔐 Auth backend running on port ${PORT}`));
