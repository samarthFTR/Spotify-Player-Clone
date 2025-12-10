const API_BASE = "http://localhost:5000" || "https://spotify-player-clone-a9rr.vercel.app";
window.API_BASE = API_BASE;

/*const DEFAULT_COVER = "https://images.unsplash.com/photo-1464375117522-1311d6a5b81a?auto=format&fit=crop&w=600&q=80";
const FALLBACK_SONGS_DATA = [
  {
    id: "fallback-1",
    title: "SoundHelix Song 1",
    artist: "SoundHelix",
    album: "SoundHelix Collection",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80",
    duration: 348,
    order: 1
  },
  {
    id: "fallback-2",
    title: "SoundHelix Song 2",
    artist: "SoundHelix",
    album: "SoundHelix Collection",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
    duration: 328,
    order: 2
  },
  {
    id: "fallback-3",
    title: "SoundHelix Song 3",
    artist: "SoundHelix",
    album: "SoundHelix Collection",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81a?auto=format&fit=crop&w=600&q=80",
    duration: 307,
    order: 3
  },
  {
    id: "fallback-4",
    title: "Acoustic Breeze",
    artist: "Bensound",
    album: "Royalty Free",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_8a5e8c5a90.mp3?filename=acoustic-breeze-12072.mp3",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    duration: 223,
    order: 4
  },
  {
    id: "fallback-5",
    title: "Creative Minds",
    artist: "Bensound",
    album: "Royalty Free",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_f5caa1810b.mp3?filename=creative-minds-12039.mp3",
    coverUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80",
    duration: 311,
    order: 5
  }
];*/

const songsCarousel = document.getElementById("songsCarousel");
const likedCard = document.getElementById("likedCard");
const likedSummaryCount = document.getElementById("likedSummaryCount");
const likedSummarySubtitle = document.getElementById("likedSummarySubtitle");
const searchForm = document.getElementById("songSearchForm");
const searchInput = document.getElementById("songSearchInput");
const searchClearButton = document.getElementById("songSearchClear");
if (searchClearButton) {
  searchClearButton.classList.add("hidden");
}
const loadingMessage = document.createElement("p");
loadingMessage.className = "text-gray-400 text-sm";
loadingMessage.textContent = "Loading songs...";

let songsCache = [];
let originalSongs = [];
let searchAbortController = null;
let currentSearchTerm = "";
let activeCardId = null;

if (songsCarousel) {
  songsCarousel.appendChild(loadingMessage);
}

function formatDuration(seconds) {
  const totalSeconds = Math.floor(Number(seconds) || 0);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function createSongCard(song) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "min-w-[180px] bg-gray-800 rounded-lg p-3 flex-shrink-0 text-left hover:bg-gray-700 transition focus:outline-none";
  card.dataset.songId = song.id;

  const coverSrc = song.cover || DEFAULT_COVER;
  const coverImg = document.createElement("img");
  coverImg.src = coverSrc;
  coverImg.alt = song.title;
  coverImg.className = "w-full h-36 rounded-md object-cover mb-3";
  coverImg.loading = "lazy";
  coverImg.addEventListener("error", () => {
    if (coverImg.src === DEFAULT_COVER) return;
    coverImg.src = DEFAULT_COVER;
  });

  const titleEl = document.createElement("h3");
  titleEl.className = "font-semibold text-white truncate";
  titleEl.textContent = song.title;

  const artistEl = document.createElement("p");
  artistEl.className = "text-gray-400 text-sm truncate";
  artistEl.textContent = song.artist;

  const durationEl = document.createElement("p");
  durationEl.className = "text-gray-500 text-xs";
  durationEl.textContent = formatDuration(song.duration);

  card.appendChild(coverImg);
  card.appendChild(titleEl);
  card.appendChild(artistEl);
  card.appendChild(durationEl);

  card.addEventListener("click", () => {
    if (!songsCache.length || typeof Player === "undefined") return;
    if (typeof Player.setQueue === "function") {
      Player.setQueue(songsCache, { selectFirst: false });
    }
    if (typeof Player.playSongById === "function") {
      Player.playSongById(song.id);
    }
  });

  return card;
}

function clearActiveCard() {
  if (!activeCardId) return;
  const previous = songsCarousel?.querySelector(`[data-song-id="${activeCardId}"]`);
  if (previous) {
    previous.classList.remove("ring-2", "ring-green-500");
  }
}

function markActiveCard(songId) {
  clearActiveCard();
  if (!songId) return;
  const nextCard = songsCarousel?.querySelector(`[data-song-id="${songId}"]`);
  if (nextCard) {
    nextCard.classList.add("ring-2", "ring-green-500");
  }
  activeCardId = songId || null;
}

async function loadSongs(query, options = {}) {
  if (!songsCarousel) return;
  try {
    const url = new URL(`${API_BASE}/api/songs`);
    if (query) {
      url.searchParams.set("search", query.trim());
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch songs: ${response.status}`);
    }
    const data = await response.json();
    const mappedSongs = mapSongs(data);
    if (mappedSongs.length) {
      renderSongs(mappedSongs, options);
      if (!query) {
        originalSongs = mappedSongs;
      }
      return;
    }
    renderSongs(mapSongs(FALLBACK_SONGS_DATA), options);
  } catch (error) {
    console.error(error);
    renderSongs(mapSongs(FALLBACK_SONGS_DATA), options);
  }
}

function filterSongsByTerm(term) {
  const q = (term || "").trim().toLowerCase();
  const source = originalSongs.length ? originalSongs : songsCache;
  if (!q) return source;
  return source.filter(song => {
    const haystack = [song.title, song.artist, song.album]
      .filter(Boolean)
      .map(value => value.toLowerCase());
    return haystack.some(value => value.includes(q));
  });
}

window.addEventListener("player:track-changed", event => {
  const song = event.detail?.song;
  markActiveCard(song?.id);
});

function mapSongs(collection) {
  return (Array.isArray(collection) ? collection : [])
    .map((rawSong, index) => normalizeSong(rawSong, index))
    .filter(Boolean);
}

function normalizeSong(rawSong, index = 0) {
  if (!rawSong || typeof rawSong !== "object") return null;
  const coverUrl = rawSong.coverUrl || rawSong.cover || rawSong.image || DEFAULT_COVER;
  const audioUrl = rawSong.audioUrl || rawSong.src || "";
  if (!audioUrl) return null;
  const id = rawSong._id || rawSong.id || rawSong.songId || `fallback-${index}-${audioUrl}`;
  return {
    ...rawSong,
    id,
    title: rawSong.title || "Untitled",
    artist: rawSong.artist || "Unknown Artist",
    duration: Number(rawSong.duration) || 0,
    cover: coverUrl,
    coverUrl,
    audioUrl,
    src: audioUrl
  };
}

function renderSongs(songs, options = {}) {
  const emptyText = options.emptyMessage;
  songsCache = songs;
  activeCardId = null;
  if (!songsCarousel) return;
  songsCarousel.innerHTML = "";
  if (!songsCache.length) {
    const emptyMessageEl = document.createElement("p");
    emptyMessageEl.className = "text-gray-400 text-sm";
    emptyMessageEl.textContent = emptyText || "No songs available right now.";
    songsCarousel.appendChild(emptyMessageEl);
    if (typeof Player !== "undefined" && Player.setQueue) {
      Player.setQueue([], { selectFirst: false });
    }
    return;
  }

  songsCache.forEach(song => {
    const card = createSongCard(song);
    songsCarousel.appendChild(card);
  });

  if (typeof Player !== "undefined" && Player.setQueue) {
    Player.setQueue(songsCache, { selectFirst: false });
  }
}

async function searchSongs(term) {
  const query = (term || "").trim();
  currentSearchTerm = query;
  syncSearchClearButton();
  if (!query) {
    renderSongs(originalSongs.length ? originalSongs : songsCache, { emptyMessage: "No songs available right now." });
    return;
  }
  const fallbackToLocalResults = () => {
    const filtered = filterSongsByTerm(query);
    renderSongs(filtered, { emptyMessage: "No songs match your search." });
  };

  if (searchAbortController) {
    searchAbortController.abort();
  }

  searchAbortController = new AbortController();
  try {
    const url = new URL(`${API_BASE}/api/songs/search`);
    url.searchParams.set("q", query);
    const response = await fetch(url.toString(), { signal: searchAbortController.signal });
    if (!response.ok) throw new Error("Failed search request");
    const data = await response.json();
    const mapped = mapSongs(data);
    if (mapped.length) {
      renderSongs(mapped, { emptyMessage: "No songs match your search." });
    } else {
      fallbackToLocalResults();
    }
  } catch (error) {
    if (error.name === "AbortError") return;
    console.error(error);
    fallbackToLocalResults();
  }
}

function syncSearchClearButton() {
  if (!searchInput || !searchClearButton) return;
  const shouldShow = Boolean(searchInput.value && searchInput.value.trim().length);
  searchClearButton.classList.toggle("hidden", !shouldShow);
}

if (searchForm && searchInput) {
  searchForm.addEventListener("submit", event => {
    event.preventDefault();
    searchSongs(searchInput.value);
  });
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    syncSearchClearButton();
    if (!searchInput.value) {
      searchSongs("");
    }
  });
}

if (searchClearButton) {
  searchClearButton.addEventListener("click", () => {
    searchInput.value = "";
    searchSongs("");
    searchInput.focus();
  });
}

function updateLikedSummary(total, { loading = false } = {}) {
  if (!likedSummaryCount || !likedSummarySubtitle) return;
  if (loading) {
    likedSummaryCount.textContent = "--";
    likedSummarySubtitle.textContent = "Fetching your favorites...";
    return;
  }
  const count = typeof total === "number" ? total : 0;
  likedSummaryCount.textContent = count.toString().padStart(2, "0");
  likedSummarySubtitle.textContent = count
    ? "Tap to keep vibing with your picks"
    : "Save songs to build this playlist";
}

async function fetchLikedSummary() {
  try {
    const response = await fetch(`${API_BASE}/api/liked`);
    if (!response.ok) throw new Error(`Failed to fetch liked songs: ${response.status}`);
    const data = await response.json();
    updateLikedSummary(Array.isArray(data) ? data.length : 0);
  } catch (error) {
    console.error(error);
    updateLikedSummary(0);
  }
}

function bootstrapLikedSummary() {
  if (!likedSummaryCount) return;
  updateLikedSummary(0, { loading: true });
  fetchLikedSummary();
}

window.addEventListener("player:liked-updated", event => {
  const liked = event.detail?.liked || [];
  updateLikedSummary(liked.length);
});

async function initializeApp() {
  bootstrapLikedSummary();
  if (typeof Player !== "undefined" && Player.init) {
    try {
      await Player.init();
    } catch (error) {
      console.error(error);
    }
  } else {
    console.warn("Player module is not available.");
  }
  await loadSongs();
}

initializeApp();
