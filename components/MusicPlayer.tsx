"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import type { PlaylistKey, Track } from "../lib/tracks";

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

interface YTEvent {
  target: YTPlayer;
  data: number;
}

interface YTNamespace {
  Player: new (element: HTMLElement, options: {
    videoId: string;
    playerVars?: Record<string, number | string>;
    events?: {
      onReady?: (event: YTEvent) => void;
      onStateChange?: (event: YTEvent) => void;
      onError?: (event: YTEvent) => void;
    };
  }) => YTPlayer;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const EMPTY_TRACK: Track = {
  id: "empty",
  title: "Add your first authorized track",
  artist: "YouTube video ID required",
  film: "",
  year: 0,
  duration: 0,
  videoId: "",
};

const playlistLabels: Record<PlaylistKey, string> = {
  classics: "Classics",
  lateNight: "Late Night",
  goldenHour: "Golden Hour",
};

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

function loadYouTubeApi() {
  return new Promise<YTNamespace>((resolve, reject) => {
    if (window.YT) return resolve(window.YT);

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (window.YT) resolve(window.YT);
      else reject(new Error("YouTube IFrame API failed to initialize."));
    };

    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => reject(new Error("Could not load YouTube IFrame API."));
      document.head.appendChild(script);
    }
  });
}

function TransportIcon({ type }: { type: "prev" | "next" }) {
  return type === "prev" ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M6 5h2v14H6zm3.5 7L19 5.5v13z" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M16 5h2v14h-2zM5 5.5 14.5 12 5 18.5z" /></svg>
  );
}

function PlayPauseIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M7 5h3v14H7zm7 0h3v14h-3z" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5 translate-x-px" fill="currentColor" aria-hidden="true"><path d="m8 5 11 7-11 7z" /></svg>
  );
}

function SeekBar({ progress, onSeek }: { progress: number; onSeek: (value: number) => void }) {
  return (
    <div className="group relative flex h-6 w-full items-center">
      <div className="pointer-events-none absolute inset-x-0 h-[3px] overflow-hidden rounded-full bg-white/15">
        <div className="h-full rounded-full bg-accent shadow-[0_0_12px_rgba(247,198,106,0.75)]" style={{ width: `${progress * 100}%` }} />
      </div>
      <input
        aria-label="Seek"
        type="range"
        min="0"
        max="1"
        step="0.001"
        value={progress}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="relative z-10 h-6 w-full cursor-pointer appearance-none bg-transparent accent-accent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:opacity-0 [&::-webkit-slider-thumb]:transition-opacity group-hover:[&::-webkit-slider-thumb]:opacity-100"
      />
    </div>
  );
}

export function MusicPlayer({ playlists }: { playlists: Record<PlaylistKey, Track[]> }) {
  const [playlist, setPlaylist] = useState<PlaylistKey>("classics");
  const tracks = playlists[playlist];
  const [index, setIndex] = useState(0);
  const current = tracks[index] ?? EMPTY_TRACK;

  const desktopHost = useRef<HTMLDivElement>(null);
  const mobileHost = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const [desktop, setDesktop] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [apiReady, setApiReady] = useState(false);

  const hasTrack = Boolean(current.videoId);
  const activeHost = desktop ? desktopHost.current : mobileHost.current;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");
    const update = () => setDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
    setProgress(0);
    setElapsed(0);
    setDuration(0);
  }, [playlist]);

  const createPlayer = useCallback(async (videoId: string) => {
    if (!videoId) return;
    const host = desktop ? desktopHost.current : mobileHost.current;
    if (!host) return;

    const YT = await loadYouTubeApi();
    setApiReady(true);
    player.current?.destroy();

    player.current = new YT.Player(host, {
      videoId,
      playerVars: { autoplay: 0, controls: 1, playsinline: 1, rel: 0, origin: window.location.origin },
      events: {
        onReady: (event) => {
          setDuration(event.target.getDuration());
          setElapsed(0);
          setProgress(0);
        },
        onStateChange: (event) => {
          if (!window.YT) return;
          if (event.data === window.YT.PlayerState.PLAYING) setPlaying(true);
          if (event.data === window.YT.PlayerState.PAUSED) setPlaying(false);
          if (event.data === window.YT.PlayerState.ENDED) {
            setPlaying(false);
            setIndex((old) => (old + 1) % tracks.length);
          }
        },
        onError: (event) => {
          track("youtube_track_error", { code: String(event.data), videoId });
          setIndex((old) => tracks.length ? (old + 1) % tracks.length : 0);
        },
      },
    });
  }, [desktop, tracks.length]);

  useEffect(() => {
    if (!hasTrack) return;
    void createPlayer(current.videoId);
    return () => player.current?.destroy();
  }, [createPlayer, current.videoId, desktop, hasTrack]);

  useEffect(() => {
    if (!apiReady) return;
    const id = window.setInterval(() => {
      if (!player.current) return;
      const now = player.current.getCurrentTime();
      const total = player.current.getDuration();
      setElapsed(now);
      setDuration(total);
      setProgress(total ? now / total : 0);
    }, 250);
    return () => window.clearInterval(id);
  }, [apiReady]);

  const seek = (value: number) => {
    const total = player.current?.getDuration() ?? duration;
    player.current?.seekTo(value * total, true);
    setProgress(value);
    setElapsed(value * total);
  };

  const toggle = () => {
    if (!player.current) return;
    if (playing) player.current.pauseVideo(); else player.current.playVideo();
  };

  const next = () => tracks.length && setIndex((old) => (old + 1) % tracks.length);
  const prev = () => tracks.length && setIndex((old) => (old - 1 + tracks.length) % tracks.length);

  const selectPlaylist = (key: PlaylistKey) => {
    if (key === playlist) return;
    player.current?.destroy();
    player.current = null;
    setApiReady(false);
    setPlaylist(key);
  };

  const metadata = useMemo(() => current.film ? `${current.film} · ${current.year}` : "Your authorized YouTube upload", [current.film, current.year]);

  return (
    <section aria-label="Music player" className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-3xl px-[max(1rem,env(safe-area-inset-left))] pb-[max(1rem,env(safe-area-inset-bottom))] pr-[max(1rem,env(safe-area-inset-right))]">
      <div className="mb-3 flex justify-center gap-1.5">
        {(Object.keys(playlists) as PlaylistKey[]).map((key) => (
          <button key={key} onClick={() => selectPlaylist(key)} className={`rounded-full border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] backdrop-blur-md transition ${key === playlist ? "border-white/20 bg-white/15 text-white" : "border-white/10 bg-black/15 text-white/50 hover:text-white/80"}`}>
            {playlistLabels[key]}
          </button>
        ))}
      </div>

      <div className="hidden sm:flex">
        <div className="player-glass flex min-h-[224px] w-full items-center gap-4 rounded-full p-3 pr-5">
          <div className="relative h-[200px] w-[200px] shrink-0 overflow-hidden rounded-[24px] bg-black/30 shadow-2xl">
            <div ref={desktopHost} className="yt-frame-wrap h-full w-full" />
            {!hasTrack && <div className="absolute inset-0 grid place-items-center bg-black/35 p-5 text-center text-xs text-white/70">Add an authorized YouTube video ID in lib/tracks.ts</div>}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-semibold text-white">{current.title}</h1>
            <p className="truncate text-[12.5px] text-white/70">{current.artist}</p>
            <p className="mt-1 truncate text-[10px] uppercase tracking-[0.14em] text-white/40">{metadata}</p>
            <div className="mt-3"><SeekBar progress={progress} onSeek={seek} /></div>
            <div className="mt-0.5 flex items-center justify-between text-[10.5px] tabular-nums text-white/55"><span>{formatTime(elapsed)}</span><span>{formatTime(duration || current.duration)}</span></div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button onClick={prev} className="grid h-11 w-11 place-items-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white" aria-label="Previous track"><TransportIcon type="prev" /></button>
            <button onClick={toggle} disabled={!hasTrack} className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-b from-accent-soft to-accent text-black shadow-[0_0_28px_rgba(247,198,106,0.32)] ring-1 ring-white/25 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40" aria-label={playing ? "Pause" : "Play"}><PlayPauseIcon playing={playing} /></button>
            <button onClick={next} className="grid h-11 w-11 place-items-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white" aria-label="Next track"><TransportIcon type="next" /></button>
          </div>
        </div>
      </div>

      <div className="sm:hidden">
        <div className="player-glass rounded-[26px] p-4">
          <div className="flex flex-col gap-3">
            <div className="relative h-[200px] w-full overflow-hidden rounded-[22px] bg-black/30">
              <div ref={mobileHost} className="yt-frame-wrap h-full w-full" />
              {!hasTrack && <div className="absolute inset-0 grid place-items-center bg-black/35 p-5 text-center text-xs text-white/70">Add an authorized YouTube video ID</div>}
            </div>
            <div className="min-w-0"><h1 className="truncate text-sm font-semibold">{current.title}</h1><p className="truncate text-xs text-white/70">{current.artist}</p></div>
          </div>
          <div className="mt-3"><SeekBar progress={progress} onSeek={seek} /></div>
          <div className="mt-1 flex items-center justify-between">
            <div className="text-[10.5px] tabular-nums text-white/55">{formatTime(elapsed)} <span className="mx-1">/</span> {formatTime(duration || current.duration)}</div>
            <div className="flex items-center gap-1">
              <button onClick={prev} className="grid min-h-11 min-w-11 place-items-center rounded-full text-white/75" aria-label="Previous track"><TransportIcon type="prev" /></button>
              <button onClick={toggle} disabled={!hasTrack} className="grid h-[52px] w-[52px] place-items-center rounded-full bg-gradient-to-b from-accent-soft to-accent text-black shadow-[0_0_28px_rgba(247,198,106,0.32)] ring-1 ring-white/25 disabled:opacity-40" aria-label={playing ? "Pause" : "Play"}><PlayPauseIcon playing={playing} /></button>
              <button onClick={next} className="grid min-h-11 min-w-11 place-items-center rounded-full text-white/75" aria-label="Next track"><TransportIcon type="next" /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
