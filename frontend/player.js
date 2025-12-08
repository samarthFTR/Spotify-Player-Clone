(function () {
  const API_BASE = "http://localhost:5000" || "https://spotify-player-clone-production.up.railway.app";
  const FALLBACK_COVER = "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80";

  const state = {
    songs: [],
    currentIndex: -1,
    currentSong: null,
    likedIds: new Set(),
    initialized: false
  };

  const elements = {
    audio: null,
    playPause: null,
    title: null,
    artist: null,
    cover: null,
    currentTime: null,
    duration: null,
    progress: null,
    progressContainer: null,
    volume: null,
    likeBtn: null,
    defaults: {
      title: "Select a Song",
      artist: "Artist",
      cover: FALLBACK_COVER
    }
  };

  function mapSong(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }
    return {
      id: raw._id || raw.id || raw.songId || null,
      title: raw.title || "Untitled",
      artist: raw.artist || "Unknown Artist",
      album: raw.album || "Unknown Album",
      cover: raw.coverUrl || raw.image || FALLBACK_COVER,
      src: raw.audioUrl || raw.src || "",
      duration: Number(raw.duration) || 0
    };
  }

  function queryElements() {
    elements.audio = document.getElementById("audio");
    if (!elements.audio) {
      return false;
    }
    elements.playPause = document.getElementById("playPause");
    elements.title = document.getElementById("title");
    elements.artist = document.getElementById("artist");
    elements.cover = document.getElementById("cover");
    elements.currentTime = document.getElementById("currentTime");
    elements.duration = document.getElementById("duration");
    elements.progress = document.getElementById("progress");
    elements.progressContainer = document.getElementById("progressContainer");
    elements.volume = document.getElementById("volume");
    elements.likeBtn = document.getElementById("likeBtn");

    if (elements.title && elements.title.textContent) {
      elements.defaults.title = elements.title.textContent;
    }
    if (elements.artist && elements.artist.textContent) {
      elements.defaults.artist = elements.artist.textContent;
    }
    if (elements.cover && elements.cover.src) {
      elements.defaults.cover = elements.cover.src;
    }
    return true;
  }

  function formatTime(seconds) {
    const total = Math.floor(seconds) || 0;
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function updatePlayPauseIcon(isPlaying) {
    const icon = elements.playPause;
    if (!icon) return;
    if (isPlaying) {
      icon.classList.remove("fa-play-circle");
      icon.classList.add("fa-pause-circle");
    } else {
      icon.classList.remove("fa-pause-circle");
      icon.classList.add("fa-play-circle");
    }
  }

  function updateLikeButton() {
    const btn = elements.likeBtn;
    if (!btn) return;
    if (state.currentSong && state.likedIds.has(state.currentSong.id)) {
      btn.classList.remove("far", "text-gray-400");
      btn.classList.add("fas", "text-green-500");
    } else {
      btn.classList.remove("fas", "text-green-500");
      btn.classList.add("far", "text-gray-400");
    }
  }

  function updateMetadata(song) {
    if (!song) return;
    if (elements.title) elements.title.textContent = song.title || elements.defaults.title;
    if (elements.artist) elements.artist.textContent = song.artist || elements.defaults.artist;
    if (elements.cover) elements.cover.src = song.cover || elements.defaults.cover;
    updateLikeButton();
  }

  function resetProgress() {
    if (elements.progress) elements.progress.style.width = "0%";
    if (elements.currentTime) elements.currentTime.textContent = "0:00";
    if (elements.duration) elements.duration.textContent = "0:00";
  }

  function updateProgress() {
    if (!elements.audio || !elements.progress || !elements.currentTime) {
      return;
    }
    const { currentTime, duration } = elements.audio;
    elements.progress.style.width = duration ? `${(currentTime / duration) * 100}%` : "0%";
    elements.currentTime.textContent = formatTime(currentTime);
  }

  async function refreshLikedSongs(emit = true) {
    try {
      const response = await fetch(`${API_BASE}/api/liked`);
      if (!response.ok) {
        throw new Error(`Failed to load liked songs: ${response.status}`);
      }
      const data = await response.json();
      const mapped = Array.isArray(data) ? data.map(mapSong).filter(Boolean) : [];
      state.likedIds = new Set(mapped.map(item => item.id).filter(Boolean));
      if (emit) {
        window.dispatchEvent(new CustomEvent("player:liked-updated", { detail: { liked: mapped } }));
      }
      return mapped;
    } catch (error) {
      console.error(error);
      state.likedIds = new Set();
      if (emit) {
        window.dispatchEvent(new CustomEvent("player:liked-updated", { detail: { liked: [] } }));
      }
      return [];
    } finally {
      updateLikeButton();
    }
  }

  async function toggleLike() {
    if (!state.currentSong || !state.currentSong.id) {
      return;
    }
    const songId = state.currentSong.id;
    const liked = state.likedIds.has(songId);
    const url = `${API_BASE}/api/liked/${songId}`;
    try {
      if (liked) {
        const response = await fetch(url, { method: "DELETE" });
        if (!response.ok && response.status !== 404) {
          throw new Error(`Failed to unlike song: ${response.status}`);
        }
      } else {
        const response = await fetch(url, { method: "POST" });
        if (!response.ok) {
          throw new Error(`Failed to like song: ${response.status}`);
        }
      }
      await refreshLikedSongs(true);
    } catch (error) {
      console.error(error);
    } finally {
      updateLikeButton();
    }
  }

  async function playIndex(index, opts = {}) {
    if (!elements.audio || !Array.isArray(state.songs) || !state.songs.length) {
      return;
    }
    const clamped = index < 0 ? state.songs.length - 1 : index % state.songs.length;
    const song = state.songs[clamped];
    if (!song || !song.src) {
      return;
    }
    const { autoPlay = true } = opts;
    const wasSameSong = state.currentSong && state.currentSong.id === song.id;
    state.currentIndex = clamped;
    state.currentSong = song;
    elements.audio.src = song.src;
    resetProgress();
    updateMetadata(song);
    if (song.duration && elements.duration) {
      elements.duration.textContent = formatTime(song.duration);
    }
    if (autoPlay || !wasSameSong) {
      try {
        await elements.audio.play();
        updatePlayPauseIcon(true);
      } catch (error) {
        console.error("Autoplay prevented", error);
        updatePlayPauseIcon(false);
      }
    }
    window.dispatchEvent(new CustomEvent("player:track-changed", { detail: { song, index: clamped } }));
  }

  function togglePlay() {
    if (!elements.audio) return;
    if (!state.currentSong && state.songs.length) {
      playIndex(0, { autoPlay: true });
      return;
    }
    if (elements.audio.paused) {
      elements.audio.play().then(() => {
        updatePlayPauseIcon(true);
      }).catch(error => {
        console.error("Playback failed", error);
      });
    } else {
      elements.audio.pause();
      updatePlayPauseIcon(false);
    }
  }

  function nextSong() {
    if (!state.songs.length) return;
    const nextIndex = state.currentIndex + 1;
    playIndex(nextIndex >= state.songs.length ? 0 : nextIndex);
  }

  function previousSong() {
    if (!state.songs.length) return;
    const prevIndex = state.currentIndex - 1;
    playIndex(prevIndex < 0 ? state.songs.length - 1 : prevIndex);
  }

  function attachEventListeners() {
    if (!elements.audio) return;
    elements.audio.addEventListener("timeupdate", updateProgress);
    elements.audio.addEventListener("loadedmetadata", () => {
      if (elements.duration) {
        elements.duration.textContent = formatTime(elements.audio.duration);
      }
    });
    elements.audio.addEventListener("play", () => updatePlayPauseIcon(true));
    elements.audio.addEventListener("pause", () => updatePlayPauseIcon(false));
    elements.audio.addEventListener("ended", () => nextSong());

    if (elements.progressContainer) {
      elements.progressContainer.addEventListener("click", event => {
        if (!elements.audio.duration) return;
        const rect = elements.progressContainer.getBoundingClientRect();
        const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
        elements.audio.currentTime = ratio * elements.audio.duration;
      });
    }

    if (elements.volume) {
      elements.volume.addEventListener("input", event => {
        const value = Number(event.target.value);
        if (!Number.isNaN(value)) {
          elements.audio.volume = value;
        }
      });
      elements.audio.volume = Number(elements.volume.value) || 1;
    }

    if (elements.likeBtn) {
      elements.likeBtn.addEventListener("click", toggleLike);
    }
  }

  function setQueue(songs, options = {}) {
    if (!Array.isArray(songs)) return;
    const mapped = songs.map(mapSong).filter(item => item && item.src);
    if (!mapped.length) {
      state.songs = [];
      state.currentIndex = -1;
      state.currentSong = null;
      updateMetadata({
        title: elements.defaults.title,
        artist: elements.defaults.artist,
        cover: elements.defaults.cover
      });
      resetProgress();
      return;
    }
    const currentId = state.currentSong ? state.currentSong.id : null;
    state.songs = mapped;
    if (currentId) {
      const idx = mapped.findIndex(song => song.id === currentId);
      if (idx !== -1) {
        state.currentIndex = idx;
        state.currentSong = mapped[idx];
        updateMetadata(state.currentSong);
        return;
      }
    }
    state.currentIndex = -1;
    state.currentSong = null;
    if (options.autoplayFirst) {
      playIndex(0, { autoPlay: true });
    } else if (options.selectFirst) {
      playIndex(0, { autoPlay: false });
    } else {
      updateMetadata({
        title: elements.defaults.title,
        artist: elements.defaults.artist,
        cover: elements.defaults.cover
      });
      resetProgress();
    }
  }

  let initPromise;
  function init() {
    if (!initPromise) {
      initPromise = (async () => {
        if (!queryElements()) {
          return await refreshLikedSongs(true);
        }
        if (!state.initialized) {
          attachEventListeners();
          state.initialized = true;
        }
        return await refreshLikedSongs(true);
      })();
    }
    return initPromise;
  }

  window.Player = {
    init,
    setQueue,
    playIndex,
    playSongById(id) {
      if (!id) return;
      const index = state.songs.findIndex(song => song.id === id);
      if (index !== -1) {
        playIndex(index);
      }
    },
    togglePlay,
    next: nextSong,
    prev: previousSong,
    getQueue() {
      return state.songs.slice();
    },
    getCurrentSong() {
      return state.currentSong ? { ...state.currentSong } : null;
    },
    isLiked(id) {
      return state.likedIds.has(id);
    },
    refreshLikedSongs,
    getLikedIds() {
      return new Set(Array.from(state.likedIds));
    }
  };

  window.togglePlay = togglePlay;
  window.nextSong = nextSong;
  window.prevSong = previousSong;
})();
async function toggleLike(songId) {
  const heart = document.getElementById("player-like-btn");

  if (!heart.dataset.liked) {
    // LIKE
    await fetch(`${API_BASE}/api/liked/${songId}`, { method: "POST" });
    heart.classList.add("text-green-500");
    heart.dataset.liked = "true";
  } else {
    // UNLIKE
    await fetch(`${API_BASE}/api/liked/${songId}`, { method: "DELETE" });
    heart.classList.remove("text-green-500");
    delete heart.dataset.liked;
  }

  updateLikedCount();
}

async function updateLikedCount() {
  const res = await fetch(`${API_BASE}/api/liked`);
  const data = await res.json();
  const counter = document.getElementById("liked-counter");
  if (counter) counter.innerText = data.length;
}
// === PLAYLIST PICKER MODAL ===

const playlistPickerModal = document.getElementById("playlistPickerModal");
const playlistPickerList = document.getElementById("playlistPickerList");

// open modal
function openPlaylistPicker() {
  if (!currentSong || !currentSong._id) {
    alert("No song is currently playing.");
    return;
  }
  loadPlaylistsForPicker();
  playlistPickerModal.classList.remove("hidden");
}

// close modal
function closePlaylistPicker() {
  playlistPickerModal.classList.add("hidden");
}

// load playlists to choose from
async function loadPlaylistsForPicker() {
  playlistPickerList.innerHTML = "<p class='text-gray-400 text-sm'>Loading...</p>";

  const res = await fetch(`${API_BASE}/playlists`);
  const playlists = await res.json();

  playlistPickerList.innerHTML = "";

  playlists.forEach(pl => {
    playlistPickerList.innerHTML += `
      <div class="flex items-center justify-between bg-gray-800 hover:bg-gray-700 p-3 rounded-lg cursor-pointer"
           onclick="addSongToPlaylist('${pl._id}', '${currentSong._id}')">

        <div>
          <p class="font-semibold">${pl.name}</p>
          <p class="text-gray-400 text-xs">${pl.songs.length} songs</p>
        </div>

        <i class="fa-solid fa-plus text-green-400 text-xl"></i>
      </div>
    `;
  });
}

// add the current song to clicked playlist
async function addSongToPlaylist(playlistId, songId) {
  const res = await fetch(`${API_BASE}/playlists/${playlistId}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ songId })
  });

  if (res.ok) {
    closePlaylistPicker();
  } else {
    alert("Failed to add song.");
  }
}
