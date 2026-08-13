import { MusicPlayer } from "../components/MusicPlayer";
import { TopBar } from "../components/TopBar";
import { playlists } from "../lib/tracks";

export default function HomePage() {
  return (
    <main className="relative isolate flex min-h-dvh flex-1 flex-col items-center justify-between overflow-hidden">
      {/* Background */}
      <img
        src="/bg/scene-wide.png"
        alt=""
        className="fixed inset-0 z-0 h-full w-full object-cover"
      />

      {/* UI */}
      <div className="relative z-30">
      <TopBar />
      <MusicPlayer playlists={playlists} />
    </main>
  );
