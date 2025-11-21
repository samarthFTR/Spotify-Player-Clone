import express from "express";
import mongoose from "mongoose";
import Song from "../models/song.model.js";
import buildSongSeed from "../data/songLibrary.js";

const router = express.Router();
const defaultSongs = buildSongSeed(120);

router.get("/", async (req, res, next) => {
  try {
    const { search, sort } = req.query;
    const sortQuery = sort === "createdAt" ? { createdAt: -1 } : { order: 1, title: 1 };

    const filter = { isActive: true };
    if (search) {
      filter.$text = { $search: search };
    }

    let songs = await Song.find(filter).sort(sortQuery);
    if (!songs.length) {
      await Song.insertMany(defaultSongs);
      songs = await Song.find(filter).sort(sortQuery);
    }
    res.json(songs);
  } catch (error) {
    next(error);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Missing search query" });
    }
    const songs = await Song.find({ isActive: true, $text: { $search: q } })
      .select({ score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" }, order: 1, title: 1 })
      .limit(50);
    res.json(songs);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid song id" });
    }
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }
    res.json(song);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, artist, album, audioUrl, coverUrl, duration, order, isActive } = req.body;
    if (!title || !artist || !audioUrl || !coverUrl || duration === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const parsedDuration = Number(duration);
    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      return res.status(400).json({ message: "Invalid duration" });
    }
    let parsedOrder;
    if (order !== undefined) {
      const value = Number(order);
      if (Number.isFinite(value)) parsedOrder = value;
    }
    const payload = {
      title,
      artist,
      album,
      audioUrl,
      coverUrl,
      duration: parsedDuration,
      isActive
    };
    if (parsedOrder !== undefined) payload.order = parsedOrder;
    const song = await Song.create(payload);
    res.status(201).json(song);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Song already exists" });
    }
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid song id" });
    }
    const updates = { ...req.body };
    if (updates.duration !== undefined) {
      const parsedDuration = Number(updates.duration);
      if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
        return res.status(400).json({ message: "Invalid duration" });
      }
      updates.duration = parsedDuration;
    }
    if (updates.order !== undefined) {
      const parsedOrder = Number(updates.order);
      if (Number.isFinite(parsedOrder)) {
        updates.order = parsedOrder;
      } else {
        delete updates.order;
      }
    }
    const song = await Song.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }
    res.json(song);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid song id" });
    }
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
