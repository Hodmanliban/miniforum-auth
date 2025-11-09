import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        const dbUrl = process.env.DB_URL;
        const dbName = process.env.DB_NAME || "auth";

        if (!dbUrl) {
            console.error("❌ DB_URL saknas i .env-filen");
            process.exit(1);
        }

        await mongoose.connect(dbUrl, { dbName });
        console.log(`✅ MongoDB Atlas connected → ${dbName}`);
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
        console.error("   Hint: Kontrollera användarnamn/lösenord och IP whitelist");
        process.exit(1);
    }
};

export default connectDB;