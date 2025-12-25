const API_BASE = "https://spotify-player-clone-a9rr.vercel.app/api" || "http://localhost:5000/api";

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
      <div class="flex items-center justify-between bg-gray-800 rounded-md p-3 hover:bg-gray-700">

        <!-- LEFT : playlist info -->
        <div onclick="window.location='innerplaylists.html?id=${pl._id}'"
            class="flex items-center space-x-3 cursor-pointer flex-1">
          <img src="${pl.coverUrl || 'https://picsum.photos/100'}"
            class="w-14 h-14 rounded-lg object-cover">
          <div>
            <p class="font-semibold">${pl.name}</p>
            <p class="text-xs text-gray-300">${pl.songs.length} songs</p>
          </div>
        </div>

        <!-- RIGHT : delete button -->
        <button
          onclick="deletePlaylist(event, '${pl._id}')"
          class="text-gray-400 hover:text-red-500 px-2">
          <i class="fa-solid fa-trash"></i>
        </button>

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
async function deletePlaylist(e, playlistId) {
  e.stopPropagation(); // prevents opening playlist

  const ok = confirm("Delete this playlist?");
  if (!ok) return;

  await fetch(`${API_BASE}/playlists/${playlistId}`, {
    method: "DELETE",
  });

  fetchPlaylists(); // refresh UI
}
