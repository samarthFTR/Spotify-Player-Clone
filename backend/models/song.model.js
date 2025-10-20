import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    album: { type: String, trim: true },
    audioUrl: { type: String, required: true },
    coverUrl: { type: String, required: true },
    duration: { type: Number, required: true },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

songSchema.index({ title: 1, artist: 1 }, { unique: true });

export default mongoose.model("Song", songSchema);
