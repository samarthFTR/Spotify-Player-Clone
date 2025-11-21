import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendRoot = join(__dirname, "..");

const API_BASE = process.env.API_BASE || "http://localhost:5000";

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureServerReady(retries = 10) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE}/api/songs`);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // swallow while waiting
    }
    await wait(500);
  }
  throw new Error("API never became ready");
}

async function runCheck() {
  const server = spawn("node", ["server.js"], {
    cwd: backendRoot,
    env: process.env,
    stdio: "inherit"
  });

  try {
    await ensureServerReady();

    const allSongsResponse = await fetch(`${API_BASE}/api/songs`);
    if (!allSongsResponse.ok) {
      throw new Error(`Songs endpoint failed: ${allSongsResponse.status}`);
    }
    const songs = await allSongsResponse.json();
    console.log(`Songs endpoint returned ${songs.length} items.`);

    const searchResponse = await fetch(`${API_BASE}/api/songs/search?q=Velvet`);
    if (!searchResponse.ok) {
      throw new Error(`Search endpoint failed: ${searchResponse.status}`);
    }
    const searchSongs = await searchResponse.json();
    const sample = searchSongs[0];
    console.log(`Search endpoint returned ${searchSongs.length} items. Sample: ${sample?.title || "n/a"}`);
  } finally {
    server.kill();
    await wait(250);
  }
}

runCheck().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
