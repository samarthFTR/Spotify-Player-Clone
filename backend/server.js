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

connectDB();

app.use("/api/songs", songRoutes);
app.use("/api/liked", likedRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/songs", songRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🎧 Server running on port ${PORT}`));
