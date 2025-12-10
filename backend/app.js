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

// API routes
app.use("/api/songs", songRoutes);
app.use("/api/liked", likedRoutes);
app.use("/api/playlists", playlistRoutes);

// optional health-check root for convenience
app.get("/", (req, res) => {
  res.json({ message: "Spotify-Player-Clone API is running" });
});

// Default 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
