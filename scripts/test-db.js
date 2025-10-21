import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

async function test() {
    const uri = process.env.DB_URL;
    if (!uri) {
        console.error("DB_URL saknas i .env");
        process.exit(1);
    }
    try {
        const client = new MongoClient(uri);
        await client.connect();
        const adminDb = client.db(process.env.DB_NAME || "admin");
        const serverInfo = await adminDb.admin().serverStatus();
        console.log("✅ Connected to MongoDB server, version:", serverInfo.version);
        await client.close();
        process.exit(0);
    } catch (err) {
        console.error("❌ MongoDB auth/connection test failed:", err.name, err.message);
        console.error("   Hint: kontrollera användarnamn/lösenord och Network Access (IP whitelist)");
        console.error(err.stack);
        process.exit(1);
    }
}

test();
