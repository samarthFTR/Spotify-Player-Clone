const API_BASE = "http://localhost:5000/api" || "https://spotify-player-clone-a9rr.vercel.app";

const playlistGrid = document.getElementById("playlistGrid");
const modal = document.getElementById("modalCreate");
const saveBtn = document.getElementById("savePlaylist");
const closeBtn = document.getElementById("closeModal");
const openBtn = document.getElementById("btnCreatePlaylist");
const nameInput = document.getElementById("newPlaylistName");

openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

async function fetchPlaylists() {
  const res = await fetch(`${API_BASE}/playlists`);
  const data = await res.json();

  playlistGrid.innerHTML = "";

  data.forEach(pl => {
  playlistGrid.innerHTML += `
    <div onclick="window.location='innerplaylists.html?id=${pl._id}'"
      class="flex items-center space-x-3 bg-gray-800 rounded-md p-3 hover:bg-gray-700 cursor-pointer">
      <img src="${pl.coverUrl || 'https://picsum.photos/100'}"
        class="w-14 h-14 rounded-lg object-cover">
      <div>
        <p class="font-semibold">${pl.name}</p>
        <p class="text-xs text-gray-300">${pl.songs.length} songs</p>
      </div>
    </div>
  `;
});

}

saveBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  if (!name) return alert("Enter a playlist name");

  await fetch(`${API_BASE}/playlists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });

  modal.classList.add("hidden");
  nameInput.value = "";
  fetchPlaylists();
});


fetchPlaylists();
