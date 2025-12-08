const API_BASE = "http://localhost:5000/api";
const playlistId = new URLSearchParams(window.location.search).get("id");

const playlistNameEl = document.getElementById("playlistName");
const playlistCountEl = document.getElementById("playlistCount");
const playlistSongsEl = document.getElementById("playlistSongs");

const modal = document.getElementById("modalAddSongs");
const btnAddSongs = document.getElementById("btnAddSongs");
const closeModal = document.getElementById("closeModal");
const allSongsList = document.getElementById("allSongsList");

btnAddSongs.onclick = () => modal.classList.remove("hidden");
closeModal.onclick = () => modal.classList.add("hidden");


// Load playlist details and songs
async function loadPlaylist() {
  const res = await fetch(`${API_BASE}/playlists/${playlistId}`);
  const pl = await res.json();

  playlistNameEl.textContent = pl.name;
  playlistCountEl.textContent = `${pl.songs.length} songs`;

  playlistSongsEl.innerHTML = "";

  pl.songs.forEach(song => {
    const encoded = encodeURIComponent(JSON.stringify(song));

    playlistSongsEl.innerHTML += `
      <div class="flex items-center justify-between bg-gray-800 p-3 rounded-lg hover:bg-gray-700">
        <div class="flex items-center space-x-3 cursor-pointer"
             onclick="playSong(JSON.parse(decodeURIComponent('${encoded}')))">
          <img src="${song.coverUrl}" class="w-14 h-14 rounded-lg">
          <div>
            <p class="font-semibold">${song.title}</p>
            <p class="text-gray-400 text-sm">${song.artist}</p>
          </div>
        </div>

        <i class="fa-solid fa-trash text-red-400 text-xl cursor-pointer"
           onclick="removeSong('${song._id}')"></i>
      </div>
    `;
  });
}


// Remove song
async function removeSong(songId) {
  await fetch(`${API_BASE}/playlists/${playlistId}/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ songId })
  });

  loadPlaylist();
}


// Load all available songs for modal
async function loadAllSongs() {
  const res = await fetch(`${API_BASE}/songs`);
  const songs = await res.json();

  allSongsList.innerHTML = "";

  songs.forEach(song => {
    allSongsList.innerHTML += `
      <div class="flex items-center justify-between bg-gray-800 p-3 rounded-lg hover:bg-gray-700">
        <div>
          <p class="font-semibold">${song.title}</p>
          <p class="text-gray-400 text-sm">${song.artist}</p>
        </div>

        <button onclick="addSong('${song._id}')"
          class="bg-green-600 px-3 py-1 rounded-lg text-sm hover:bg-green-500">
          Add
        </button>
      </div>
    `;
  });
}


// Add song to playlist
async function addSong(songId) {
  await fetch(`${API_BASE}/playlists/${playlistId}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ songId })
  });

  loadPlaylist();
}

loadPlaylist();
loadAllSongs();
