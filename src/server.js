import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js"; // importera din db-funktion

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4100;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Basroute
app.get("/", (req, res) => {
    res.send("🔐 Auth API up ✅");
});

// Anslut till databasen och starta servern först när DB är klar
connectDb()
    .then(() => {
        app.listen(PORT, () => console.log(`🚀 Auth backend running on port ${PORT}`));
    })
    .catch((err) => {
        console.error("FEL: Kunde inte ansluta till DB, servern startas inte.", err.message);
        process.exit(1);
    });
