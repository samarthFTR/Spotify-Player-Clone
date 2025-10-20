const API_BASE = window.API_BASE || "http://localhost:5000";
window.API_BASE = API_BASE;

const DEFAULT_COVER = "https://i.ibb.co/2sVxXgM/default-cover.png";
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
];

const songsCarousel = document.getElementById("songsCarousel");
const loadingMessage = document.createElement("p");
loadingMessage.className = "text-gray-400 text-sm";
loadingMessage.textContent = "Loading songs...";

let songsCache = [];
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

async function loadSongs() {
  if (!songsCarousel) return;
  try {
    const response = await fetch(`${API_BASE}/api/songs`);
    if (!response.ok) {
      throw new Error(`Failed to fetch songs: ${response.status}`);
    }
    const data = await response.json();
    const mappedSongs = mapSongs(data);
    if (mappedSongs.length) {
      renderSongs(mappedSongs);
      return;
    }
    renderSongs(mapSongs(FALLBACK_SONGS_DATA));
  } catch (error) {
    console.error(error);
    renderSongs(mapSongs(FALLBACK_SONGS_DATA));
  }
}

if (typeof Player !== "undefined" && Player.init) {
  Player.init()
    .then(loadSongs)
    .catch(error => {
      console.error(error);
      loadSongs();
    });
} else {
  console.warn("Player module is not available.");
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

function renderSongs(songs) {
  songsCache = songs;
  activeCardId = null;
  if (!songsCarousel) return;
  songsCarousel.innerHTML = "";
  if (!songsCache.length) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "text-gray-400 text-sm";
    emptyMessage.textContent = "No songs available right now.";
    songsCarousel.appendChild(emptyMessage);
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