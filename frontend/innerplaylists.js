// innerplaylists.js
const API_BASE = "http://localhost:5000/api"; // change to your production API_BASE if needed

function qs(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

const playlistId = qs("id");
if (!playlistId) {
  document.getElementById("playlistName").textContent = "Playlist not found";
  throw new Error("Missing playlist id");
}

const playlistCover = document.getElementById("playlistCover");
const playlistName = document.getElementById("playlistName");
const playlistCount = document.getElementById("playlistCount");
const songList = document.getElementById("songList");
const openAddSong = document.getElementById("openAddSong");

async function loadPlaylist() {
  try {
    const res = await fetch(`${API_BASE}/playlists/${playlistId}`);
    if (!res.ok) throw new Error("Failed to fetch playlist");
    const pl = await res.json();

    playlistName.textContent = pl.name || "Playlist";
    playlistCount.textContent = `${(pl.songs || []).length} songs`;
    // if you store covers per playlist, use it; else fallback
    playlistCover.src = pl.coverUrl || "https://picsum.photos/200";

    renderSongs(pl.songs || []);
  } catch (err) {
    console.error(err);
    playlistName.textContent = "Failed to load playlist";
  }
}

function renderSongs(songs) {
  songList.innerHTML = "";
  if (!songs.length) {
    songList.innerHTML = `<li class="text-gray-400">No songs yet</li>`;
    return;
  }

  songs.forEach(s => {
    // s might be full song doc (populated) or just an id — backend populates songs for GET /:id
    const title = s.title || s.name || "Untitled";
    const artist = s.artist || "-";
    const cover = s.coverUrl || s.image || "https://picsum.photos/80";

    const li = document.createElement("li");
    li.className = "flex items-center gap-3 bg-gray-800 p-3 rounded-md";
    li.innerHTML = `
      <img src="${cover}" class="w-12 h-12 rounded object-cover">
      <div class="flex-1">
        <div class="font-semibold">${title}</div>
        <div class="text-xs text-gray-400">${artist}</div>
      </div>
      <div class="flex items-center gap-3">
        <button class="like-btn" data-id="${s._id || s.id || s.songId}">
          <i class="fa-regular fa-heart"></i>
        </button>
        <button class="play-btn" data-src="${s.audioUrl || s.url || ''}" title="Play">
          <i class="fa fa-play"></i>
        </button>
      </div>
    `;
    songList.appendChild(li);
  });

  // hook event listeners (example: play or like)
  document.querySelectorAll(".play-btn").forEach(b => {
    b.addEventListener("click", e => {
      const src = b.dataset.src;
      if (!src) return alert("No audio source");
      // set your page's player to play src — depends on your shared player code
      document.getElementById("footerSongImg").src = b.closest("li").querySelector("img").src;
      document.getElementById("footerSongTitle").textContent = b.closest("li").querySelector(".font-semibold").textContent;
      // if you have a global audio element / player controller, call it here
    });
  });
}

openAddSong.addEventListener("click", async () => {
  const songId = prompt("Enter songId to add to this playlist:");
  if (!songId) return;
  try {
    const res = await fetch(`${API_BASE}/playlists/${playlistId}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return alert("Failed to add: " + (err.message || res.statusText));
    }
    // response returns populated playlist — reload UI
    const updated = await res.json();
    renderSongs(updated.songs || []);
    playlistCount.textContent = `${(updated.songs || []).length} songs`;
  } catch (err) {
    console.error(err);
    alert("Request failed");
  }
});

loadPlaylist();
