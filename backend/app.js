import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import songRoutes from "./routes/song.routes.js";
import likedRoutes from "./routes/liked.routes.js";
import playlistRoutes from "./routes/playlists.routes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// connect to DB on cold-start / import
connectDB();

// API routes (Vercel strips /api prefix before routing to serverless function)
app.use("/songs", songRoutes);
app.use("/liked", likedRoutes);
app.use("/playlists", playlistRoutes);

// optional health-check root for convenience
app.get("/", (req, res) => {
  res.json({ message: "Spotify-Player-Clone API is running" });
});

export default app;
