import express from "express";
import mongoose from "mongoose";
import LikedSong from "../models/liked.model.js";
import Song from "../models/song.model.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const liked = await LikedSong.find().populate("song").sort({ createdAt: -1 });
    const songs = liked.filter(entry => entry.song).map(entry => entry.song);
    res.json(songs);
  } catch (error) {
    next(error);
  }
});

router.post("/:songId", async (req, res, next) => {
  try {
    const { songId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(songId)) {
      return res.status(400).json({ message: "Invalid song id" });
    }
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }
    const existing = await LikedSong.findOne({ song: songId });
    if (existing) {
      return res.status(200).json(song);
    }
    await LikedSong.create({ song: songId });
    res.status(201).json(song);
  } catch (error) {
    next(error);
  }
});

router.delete("/:songId", async (req, res, next) => {
  try {
    const { songId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(songId)) {
      return res.status(400).json({ message: "Invalid song id" });
    }
    await LikedSong.findOneAndDelete({ song: songId });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
