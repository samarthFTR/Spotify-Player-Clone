import express from "express";
import LikedSong from "../models/liked.model.js";

const router = express.Router();

// Get all liked songs
router.get("/", async (req, res) => {
  const liked = await LikedSong.find();
  res.json(liked);
});

// Like a song
router.post("/", async (req, res) => {
  const { title, artist } = req.body;
  const newLike = new LikedSong({ title, artist });
  await newLike.save();
  res.status(201).json(newLike);
});

export default router;
