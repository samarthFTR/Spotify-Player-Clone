import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Song from "../models/song.model.js";
import buildSongSeed from "../data/songLibrary.js";

const TARGET_TOTAL = Number(process.argv[2]) || 120;

async function seedSongs() {
  await connectDB();

  const existingCount = await Song.countDocuments();
  if (existingCount >= TARGET_TOTAL) {
    console.log(`Database already has ${existingCount} songs. Skipping seed.`);
    return;
  }

  console.log(`Found ${existingCount} songs. Refreshing collection with ${TARGET_TOTAL} records...`);
  await Song.deleteMany({});
  const payload = buildSongSeed(TARGET_TOTAL).map(song => ({ ...song, isActive: true }));
  await Song.insertMany(payload, { ordered: false });
  console.log(`Seed complete ✔ Inserted ${payload.length} songs.`);
}

seedSongs()
  .catch(error => {
    console.error("Song seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
