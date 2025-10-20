import express from "express";
import mongoose from "mongoose";
import Song from "../models/song.model.js";

const router = express.Router();

const defaultSongs = [
  {
    title: "SoundHelix Song 1",
    artist: "SoundHelix",
    album: "SoundHelix Collection",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80",
    duration: 348,
    order: 1
  },
  {
    title: "SoundHelix Song 2",
    artist: "SoundHelix",
    album: "SoundHelix Collection",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
    duration: 328,
    order: 2
  },
  {
    title: "SoundHelix Song 3",
    artist: "SoundHelix",
    album: "SoundHelix Collection",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81a?auto=format&fit=crop&w=600&q=80",
    duration: 307,
    order: 3
  },
  {
    title: "Acoustic Breeze",
    artist: "Bensound",
    album: "Royalty Free",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_8a5e8c5a90.mp3?filename=acoustic-breeze-12072.mp3",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    duration: 223,
    order: 4
  },
  {
    title: "Creative Minds",
    artist: "Bensound",
    album: "Royalty Free",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_f5caa1810b.mp3?filename=creative-minds-12039.mp3",
    coverUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80",
    duration: 311,
    order: 5
  }
];

router.get("/", async (req, res, next) => {
  try {
    const sortQuery = req.query.sort === "createdAt" ? { createdAt: -1 } : { order: 1, title: 1 };
    let songs = await Song.find({ isActive: true }).sort(sortQuery);
    if (!songs.length) {
      await Song.insertMany(defaultSongs);
      songs = await Song.find({ isActive: true }).sort(sortQuery);
    }
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
