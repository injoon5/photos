# Customizations

This is a fork of [sambecker/exif-photo-blog](https://github.com/sambecker/exif-photo-blog).
`.github/workflows/sync-upstream.yml` opens a PR every Monday when upstream has new commits (or run it manually from the Actions tab).

Keep changes to upstream files small, and prefer new files, so merges stay clean. When resolving a sync conflict, keep the changes below.

## Smaller blur placeholders

Blur data is generated at 96px without EXIF/ICC metadata, cutting inline page weight. Admin → Photos shows a button to regenerate oversized blur data for older photos.

- `src/photo/server.ts`: `blurImage`, `generateBase64`
- `src/photo/actions.ts`, `src/photo/query.ts`, `src/photo/update/index.ts`: backfill
- `src/photo/SyncBlurButton.tsx` (new), `src/admin/AdminPhotosClient.tsx`: button

## Lower Vercel CPU usage

- `src/app/static.ts`: photo and category pages, and their OG images, return `[]` from `generateStaticParams` instead of `undefined`. Each path renders once on first visit and is then served from cache until an admin change revalidates it, instead of rendering on every request.
- `src/app/OnDemandStaticLayout.tsx` (new) and `app/*/[photoId]/layout.tsx` (new): same for photo pages nested under categories.
- `proxy.ts`: `matcher` lists only the paths the proxy acts on (admin, private tag, OG, library edit, `/photos/*` and `/t/*` aliases), so public pages and prefetches no longer invoke it.
