import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDb() {
    try {
        const dbUrl = process.env.DB_URL;
        const dbName = process.env.DB_NAME || "auth";
        const authSource = process.env.DB_AUTH_DB || undefined;

        if (!dbUrl) {
            console.error("❌ DB_URL saknas i .env-filen");
            process.exit(1);
        }

        const options = { dbName };
        if (authSource) options.authSource = authSource;

        await mongoose.connect(dbUrl, options);
        console.log(`✅ MongoDB Atlas connected → ${dbName}`);
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.name, "-", err.message);
        // Print helpful hints without exposing credentials
        console.error("   Hint: Kontrollera användarnamn/lösenord, IP-åtkomst (Network Access) och att användaren finns i Atlas.");
        console.error(err.stack);
        process.exit(1);
    }
}
