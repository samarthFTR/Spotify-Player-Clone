import mongoose from "mongoose";

const likedSchema = new mongoose.Schema(
  {
    song: { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
  },
  {
    timestamps: false
  }
);

export default mongoose.model("LikedSong", likedSchema);
