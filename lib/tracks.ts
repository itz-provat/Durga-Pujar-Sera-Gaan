export type Track = {
  id: string;
  title: string;
  artist: string;
  film: string;
  year: number;
  duration: number;
  videoId: string;
};

// Only put videos here that you have the right to use, or that are uploaded
// by the rights holder with embedding enabled. No tracks are supplied by us.
export const playlists = {
  Mita Chatterjee : [
    {
      id: "track-01",
      title: "গোল্ড প্রিন্টের শাড়ি পরে",
      artist: "মিতা চ্যাটার্জি",
      film: "পালকিতে বৌ চলে যায়",
      year: ২০০২,
      duration: 345,
      videoId: "zoAIg8_5Cto",
    },
  ],

  lateNight: [],
  goldenHour: [],
} satisfies Record<string, Track[]>;,
  lateNight: [] as Track[],
  goldenHour: [] as Track[],
} satisfies Record<string, Track[]>;

export type PlaylistKey = keyof typeof playlists;
