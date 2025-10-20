import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import songRoutes from "./routes/song.routes.js";
import likedRoutes from "./routes/liked.routes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/songs", songRoutes);
app.use("/api/liked", likedRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🎧 Server running on port ${PORT}`));
