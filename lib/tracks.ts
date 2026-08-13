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
  classics: [
    {
      id: "track-01",
      title: "Gold Print er Saree Pore",
      artist: "Mita Chatterjer",
      film: "Palkite Bou Chole Jaay",
      year: 2002,
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
