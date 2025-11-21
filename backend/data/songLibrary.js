const AUDIO_POOL = [
  {
    name: "SoundHelix Voyage",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 348
  },
  {
    name: "SoundHelix Horizon",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: 328
  },
  {
    name: "SoundHelix Pulse",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: 307
  },
  {
    name: "SoundHelix Echo",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: 342
  },
  {
    name: "SoundHelix Drift",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    duration: 327
  },
  {
    name: "SoundHelix Skyline",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    duration: 366
  },
  {
    name: "SoundHelix Lantern",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    duration: 298
  },
  {
    name: "SoundHelix Bloom",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    duration: 311
  },
  {
    name: "SoundHelix Ember",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    duration: 301
  },
  {
    name: "SoundHelix Nova",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    duration: 325
  },
  {
    name: "Pixabay Acoustic",
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_8a5e8c5a90.mp3?filename=acoustic-breeze-12072.mp3",
    duration: 223
  },
  {
    name: "Pixabay Creative",
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_f5caa1810b.mp3?filename=creative-minds-12039.mp3",
    duration: 311
  },
  {
    name: "Pixabay Lofi",
    url: "https://cdn.pixabay.com/download/audio/2021/09/08/audio_3c7f0f7ed7.mp3?filename=lofi-study-112191.mp3",
    duration: 193
  },
  {
    name: "Pixabay Night",
    url: "https://cdn.pixabay.com/download/audio/2021/09/23/audio_74f50f437c.mp3?filename=inspiration-ambient-11336.mp3",
    duration: 255
  },
  {
    name: "Pixabay Skyline",
    url: "https://cdn.pixabay.com/download/audio/2022/03/08/audio_c4d6b80ef2.mp3?filename=deep-ambient-110624.mp3",
    duration: 289
  }
];

const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1464375117522-1311d6a5b81a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1454922915609-78549ad709bb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1468141589425-6f7d4a6f8f02?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1464375117522-1311d6a5b81a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1444824775686-4185f172c44b?auto=format&fit=crop&w=600&q=80"
];

const ARTIST_POOL = [
  "Lunar Echoes",
  "City Glow",
  "Neon Coast",
  "Golden Horizon",
  "Velvet Skyline",
  "Slow Tide",
  "Indigo Dreams",
  "Atlas Bloom",
  "Glass Parade",
  "Secret Atlas",
  "Signal Theory",
  "Northern Figure"
];

const ALBUM_POOL = [
  "Afterglow Stories",
  "Moonlit Drives",
  "Static Bloom",
  "Shimmer Field",
  "Digital Campfire",
  "Velvet Season",
  "Signal Trails",
  "Dream Lobbies",
  "Hologram Garden",
  "Urban Sketches"
];

const TITLE_PREFIX = [
  "Midnight",
  "Neon",
  "Satellite",
  "Velvet",
  "Golden",
  "Echo",
  "Crystal",
  "Solstice",
  "Retro",
  "Sapphire",
  "Northern",
  "City"
];

const TITLE_SUFFIX = [
  "Echo",
  "Pulse",
  "Glow",
  "Drift",
  "Arc",
  "Mirage",
  "Rain",
  "Wave",
  "Fields",
  "Cascade",
  "Lines",
  "Fragments"
];

const DURATIONS = [
  182,
  194,
  207,
  215,
  228,
  241,
  256,
  263,
  275,
  289,
  305,
  318
];

function makeTitle(index) {
  const prefix = TITLE_PREFIX[index % TITLE_PREFIX.length];
  const suffix = TITLE_SUFFIX[index % TITLE_SUFFIX.length];
  const series = Math.floor(index / TITLE_PREFIX.length) + 1;
  return `${prefix} ${suffix} ${series}`;
}

export function buildSongSeed(target = 120) {
  return Array.from({ length: target }, (_, index) => {
    const audio = AUDIO_POOL[index % AUDIO_POOL.length];
    const artist = ARTIST_POOL[(index + 3) % ARTIST_POOL.length];
    const album = ALBUM_POOL[(index + 7) % ALBUM_POOL.length];
    const coverUrl = COVER_IMAGES[(index + 5) % COVER_IMAGES.length];
    const duration = audio.duration || DURATIONS[index % DURATIONS.length];

    return {
      title: makeTitle(index),
      artist,
      album,
      audioUrl: audio.url,
      coverUrl,
      duration,
      order: index + 1
    };
  });
}

export default buildSongSeed;
