import { MusicPlayer } from "../components/MusicPlayer";
import { TopBar } from "../components/TopBar";
import { playlists } from "../lib/tracks";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-black">
      <img
        src="/bg/scene-wide.png"
        alt="Background test"
        className="block h-auto min-h-dvh w-full object-cover"
      />
    </main>
  );
}

      {/* UI */}
      <div className="relative z-30">
      <TopBar />
      <MusicPlayer playlists={playlists} />
    </main>
  );
