import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { getHealth } from "./controllers/healthController.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

connectDB();

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  "https://team-task-manager-theta-liard.vercel.app"
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    const isAllowedVercelApp = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin || "");

    if (!origin || allowedOrigins.includes(origin) || isAllowedVercelApp) {
      callback(null, true);
      return;
    }

    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Team Task Manager API is running" });
});

app.get("/api/health", getHealth);

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
