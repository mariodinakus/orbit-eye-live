# ORBIT EYE · Earth Intelligence Platform

**Greek / English interactive satellite tracker**, optimized for desktop and mobile and deployable to Vercel without any paid API key or build step.

## Features

- **3D interactive Earth:** rotates and follows selected satellites in continuously propagated SGP4 orbits. Select satellites by clicking the globe or the list, zoom, pan or switch to a 2D global map.
- **Actual orbital data:** CelesTrak GP **OMM / JSON**, including 6+ digit NORAD catalog numbers (unlike outdated TLE-only apps). SGP4 positions update **once per second** in your browser. An OMM epoch is displayed, so users can judge how old the underlying elements are.
- **Ground-tracking Satellite Eye:** satellite imagery map automatically follows the sub-satellite ground point. Choose **Esri World Imagery**, **NASA GIBS VIIRS date-stamped imagery**, or **CARTO/OSM dark map**. Includes explicit imagery provenance and freshness distinction.
- **Real video sources:** embedded public NASA ISS Earth-view stream, plus external links to EUMETSAT Meteosat Earth View and NASA Worldview. Not every satellite has a publicly available live camera.
- **Country/ownership:** CelesTrak SATCAT `OWNER` codes, launch date, NORAD and international IDs; clearly labeled name-derived operator inferences for major constellations.
- **Satellite collections:** stations, weather, Earth observation, science, GPS, Galileo, Starlink, OneWeb, Iridium NEXT; discovery mode samples several collections.
- **Sensor evidence:** Sentinel-2 nominal 290 km and Landsat 8/9 nominal 185 km swaths are annotated as *illustrative* geometry, not exact camera footprints. For other satellites no camera coverage is asserted.
- **Responsive bilingual UI** with search, sorting, follow, layer selection, source explanations and fallback handling.
- **Explicit demonstration mode** when upstream feeds are unavailable. DEMO satellites are fictional and unmistakably labeled; they are **never** presented as real data.

## Deploy on Vercel

1. Create a **new GitHub repository** (e.g. `orbit-eye`).
2. Extract the ZIP archive and upload **the contents of `orbit-eye-live/` into the repository root**. Do not upload only the ZIP itself.
3. On Vercel, choose **Add New > Project > Import Git Repository**.
4. Leave **Framework Preset: Other** and **Build Command: empty**. Set **Output Directory: empty/default**. The root `index.html` is a static site. Vercel deploys `/api/orbits.js` and `/api/catalog.js` as serverless functions.
5. Deploy. **No environment variable / API key is required.**

### Local preview

Run from the project root:

```bash
python -m http.server 8000
```

Go to http://localhost:8000 . The serverless API endpoints are only present on Vercel, so when served locally the app tries CelesTrak directly from the browser. If direct CORS is blocked, deploy to Vercel or use `vercel dev`.

## Data sources and technical truth

| Feature | Data source | Update cadence / limitation |
| --- | --- | --- |
| Orbit positions | CelesTrak OMM JSON + satellite.js SGP4 | Computed **locally every second**, orbit elements **cached two hours** |
| Owner/country | CelesTrak SATCAT | Cached **12 hours**; SATCAT provides owner codes, not always ultimate corporate ownership |
| Planet globe texture | Three-Globe Blue Marble imagery | Basemap image, **not live** |
| Ground basemap | Esri World Imagery | Geographic imagery, dates vary, **not live** |
| Daily imagery | NASA GIBS VIIRS/SNPP | Selected **date: two days before viewing**, not live; tiles may occasionally be unavailable |
| Real video | NASA ISS external-camera stream | NASA may show **previously recorded** footage if the live feed is unavailable |
| Near-real-time image stream | EUMETSAT Earth View | Frames about every 10 minutes, processing delay ~30 minutes |

### Accuracy notes

- **The latitude/longitude displayed is a mathematically predicted sub-satellite location**, not camera pointing. A satellite may face space, Earth, or another object. From location alone you cannot know *what it is seeing*.
- Globe point distances from Earth are **intentionally visually exaggerated**; the actual altitude numbers in the inspector are in kilometers.
- Nominal sensor swaths are limited to well-documented instruments; a circle is a schematic for context, not an exact sensor projection.
- Satellites are **downsampled for smooth 3D performance**. The fetched count may be higher than the displayed count. Search covers the loaded visualization subset, not the entire SATCAT.
- CelesTrak's recommended minimum polling frequency is **once per two hours**; this project uses browser localStorage caching and Vercel CDN caching. Do not configure minute-level upstream polling.
- Public imagery services and CDNs need an internet connection and are subject to their own terms. A public, high-traffic service may need a dedicated imagery/data agreement.
- **This is an educational display**, not certified for satellite collision avoidance, exact ground imaging footprint, operational telemetry or targeting.

## Architecture

```text
index.html             UI shell, modal interfaces
src/styles.css         Responsive dashboard styling
src/app.js             Globe, orbital engine, map, bilingual UI, controls
src/utils.mjs          Geometry, data mapping, owner codes, inference metadata
api/orbits.js          CelesTrak GP/OMM Vercel proxy
api/catalog.js         CelesTrak SATCAT Vercel proxy
api/_shared.js         Allowlist, error handling, long CDN cache
vercel.json            Security headers
```

Run `npm test` (or `node --test tests/*.test.mjs`) to check core calculations and API caching contracts. No npm package installation is needed for the static app; browser JS dependencies load from versioned public CDNs.

## Attribution

Orbit & SATCAT: © CelesTrak, T.S. Kelso (see usage policy at https://celestrak.org/usage-policy.php); SGP4: satellite.js (MIT); 3D: globe.gl / Three-Globe (MIT); 2D: MapLibre (BSD); Basemaps: Esri and imagery partners, NASA GIBS, CARTO & OpenStreetMap contributors; NASA ISS footage: NASA; EUMETSAT Earth View: EUMETSAT. Check external provider terms before commercial redistribution.

## License

App's original code is MIT licensed. This **does not** relicense any external maps, tiles, imagery, video or orbital data.