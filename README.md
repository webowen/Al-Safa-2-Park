# Al Safa 2 Park Intelligence

Vue 3 + Vite + CesiumJS digital-twin dashboard for the Al Safa 2 Park demo.

## Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173/`.

## Build

```bash
npm run build
npm run preview
```

Create a local `.env.local` file before running the app:

```text
VITE_CESIUM_ION_TOKEN=your_cesium_ion_token
VITE_USE_REMOTE_TERRAIN=true
```

The token is intentionally not committed. Configure it as an environment
variable in the hosting provider for production deployments.
