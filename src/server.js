import express from "express";
import cors from "cors";
import helmet from "helmet";
// import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import { CLIENT_URL, PORT } from "./config/config.js";

const app = express();

// Connect to MongoDB
connectDB();

// 🔒 CORS Configuration – stöd för flera origins (Netlify + localhost)
const allowedOrigins = [
  "http://localhost:5173",
  "https://miniforum123.netlify.app", // 🔹 din Netlify-app
];

// Om du även vill kunna ändra via miljövariabel (t.ex. i Render):
if (CLIENT_URL) {
  allowedOrigins.push(CLIENT_URL);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // tillåt Postman/ingen origin (t.ex. curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  })
);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// app.use(mongoSanitize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Auth server is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Auth server running on port ${PORT}`);
  console.log(`🌍 Allowed origins: ${allowedOrigins.join(", ")}`);
});
