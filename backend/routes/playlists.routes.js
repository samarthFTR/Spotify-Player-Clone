import express from "express";
import Playlist from "../models/Playlist.js";
import Song from "../models/Song.js";

const router = express.Router();

/**
 * Create playlist
 */
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name required" });
    }

    const playlist = await Playlist.create({ name, songs: [] });
    res.status(201).json(playlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Get all playlists
 */
router.get("/", async (req, res) => {
  try {
    const playlists = await Playlist.find().sort({ createdAt: -1 });
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Get playlist by id (populated songs)
 */
router.get("/:id", async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate("songs");
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Add song to playlist
 */
router.post("/:id/add", async (req, res) => {
  try {
    const { songId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(songId)) {
      return res.status(400).json({ message: "Invalid song ID" });
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    // avoid duplicates
    if (!playlist.songs.includes(songId)) playlist.songs.push(songId);

    await playlist.save();
    const populated = await playlist.populate("songs");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Remove song from playlist
 */
router.post("/:id/remove", async (req, res) => {
  try {
    const { songId } = req.body;

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    playlist.songs = playlist.songs.filter(s => s.toString() !== songId);
    await playlist.save();

    const populated = await playlist.populate("songs");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Rename playlist
 */
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
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Delete playlist
 */
router.delete("/:id", async (req, res) => {
  try {
    await Playlist.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
