import express from "express";
import mongoose from "mongoose";
const router = express.Router();

import Playlist from "../models/playlists.model.js";
import Song from "../models/song.model.js";

// 👉 Create Playlist
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Playlist name required" });
    }

    const playlist = await Playlist.create({
      name: name.trim(),
      songs: []
    });

    res.status(201).json(playlist);
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 👉 Get All Playlists (no populate here)
router.get("/", async (req, res) => {
  try {
    const playlists = await Playlist.find()
      .sort({ createdAt: -1 })
      .select("_id name songs");

    res.json(playlists);
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 👉 Get Playlist with Songs Populated
router.get("/:id", async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate("songs");

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    res.json(playlist);
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 👉 Add Song to Playlist
router.post("/:id/add", async (req, res) => {
  try {
    const { songId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(songId)) {
      return res.status(400).json({ message: "Invalid Song ID" });
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    // Prevent duplicate
    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      await playlist.save();
    }

    const populated = await Playlist.findById(req.params.id).populate("songs");
    res.json(populated);
  } catch (error) {
    console.error("Error adding song:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 👉 Remove Song From Playlist
router.post("/:id/remove", async (req, res) => {
  try {
    const { songId } = req.body;

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    playlist.songs = playlist.songs.filter(
      (s) => String(s) !== String(songId)
    );

    await playlist.save();

    const populated = await Playlist.findById(req.params.id).populate("songs");
    res.json(populated);
  } catch (error) {
    console.error("Error removing song:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 👉 Rename Playlist
router.put("/:id", async (req, res) => {
  try {
    const { name } = req.body;

    const playlist = await Playlist.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    res.json(playlist);
  } catch (error) {
    console.error("Error renaming playlist:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 👉 Delete Playlist
router.delete("/:id", async (req, res) => {
  try {
    const playlist = await Playlist.findByIdAndDelete(req.params.id);

    if (!playlist)
      return res.status(404).json({ message: "Playlist not found" });

    res.json({ message: "Playlist deleted" });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
