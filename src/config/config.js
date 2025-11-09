import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 4100;
export const DB_URL = process.env.DB_URL;
export const DB_NAME = process.env.DB_NAME || "auth_dev_shared";
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const CLIENT_URL = process.env.CLIENT_URL || "https://localhost:5173";
export const NODE_ENV = process.env.NODE_ENV || "development";

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,         // ÄNDRA från false → true
    sameSite: "None",     // ÄNDRA från "Lax" → "None"
    maxAge: 3600000
};

export const RETENTION_CONFIG = {
    INACTIVE_USERS_DAYS: parseInt(process.env.RETENTION_INACTIVE_USERS_DAYS) || 1095,
    DELETED_USERS_DAYS: parseInt(process.env.RETENTION_DELETED_USERS_DAYS) || 30,
    CONSENT_DAYS: parseInt(process.env.RETENTION_CONSENT_DAYS) || 2555,
    SECURITY_DAYS: parseInt(process.env.RETENTION_SECURITY_DAYS) || 1095
};

