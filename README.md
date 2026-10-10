# VASANT — LIVING ATELIER

A premium interactive showroom for Indian couture and traditional garments.

## Getting started

1. Install dependencies:
   npm install
2. Run the development server:
   npm run dev
3. Build for production:
   npm run build
4. Preview production build:
   npm run preview

## Important reference image requirement

The project is wired to the original boutique reference image at:

`/public/reference-showroom-reference.jpg`

The provided reference image was used as the visual design guide in the app layout, but the actual binary file is not present in the repository. Place the exact uploaded reference image there before final launch so the landing screen matches the reference composition exactly.

## Project structure

- `src/App.tsx` — showroom experience, rail focus mode, product detail modal, and admin panel.
- `src/index.css` — all styling, layout, and responsive behavior.
- `src/main.tsx` — app bootstrap.
- `public/reference-showroom-reference.jpg` — exact boutique showroom reference image to add.

## Admin access

To avoid exposing privileged credentials in frontend code, the demo admin gate is protected by an environment-configurable code.

Copy `.env.example` to `.env` and set the value:

```
VITE_ADMIN_ACCESS_CODE=your-secret-code
VITE_ENABLE_BG_REMOVAL=false
```

For a production deployment, replace the local gate with Supabase auth plus RLS-protected database tables and storage buckets.

## Local persistence

This demo uses browser localStorage for product persistence so products remain visible after refresh. This is suitable for a local preview but not a complete multi-user production setup.

## Notes

- Entry Mannequin handles the left-side sari and blouse catalog.
- Standing Mannequin handles the right-side Punjabi and trouser catalog.
- The app intentionally keeps collections independent and never shares the same backing product list.
- The rail focus mode is implemented as a premium 2D cinematic transition to preserve the exact showroom composition while providing an interactive showroom experience.

## Suggested production backend

A production-grade version should use:

- Supabase Auth for admin login
- Postgres tables for products and collections
- Storage bucket for garment uploads
- Row-level security (RLS) policies
- Optional background removal using a provider such as remove.bg or a self-hosted model

## Deployment checklist

- Add the exact reference image file to `public/reference-showroom-reference.jpg`.
- Set `VITE_ADMIN_ACCESS_CODE` in your environment.
- Confirm the showroom loads directly into the boutique composition.
- Verify the rail focus transition and the Return to Showroom control.
- Test the admin panel and product persistence.
- Validate the experience on desktop and mobile browsers.
