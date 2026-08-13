# Durga Pujor Sera Gaan

Next.js App Router + TypeScript + Tailwind CSS v4 single-page nostalgia player.

## Setup

1. Put your supplied assets at:
   - `public/bg/scene-wide.png`
   - `public/bg/scene-tall.png`
2. Install dependencies: `npm install`
3. Add only YouTube videos you have rights to use, or rights-holder uploads with embedding enabled, to `lib/tracks.ts`.
4. Run `npm run dev`.

## Adding a song

Add one object to the chosen playlist array. Example shape:

```ts
{ id: "song-01", title: "...", artist: "...", film: "...", year: 1999, duration: 245, videoId: "AUTHORIZED_VIDEO_ID" }
```

No copyrighted tracks or video IDs are supplied by this project.

## YouTube policy note

The YouTube player is intentionally visible and interactive. It is not hidden, reduced to a 1px element, or made transparent. This matters because the YouTube IFrame Player API is being used to deliver both the audio and video.
