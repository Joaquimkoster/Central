# Central Desktop

The Central desktop application uses React 19, Vite 8, and Tauri 2. It includes a home dashboard, sidebar navigation, and API operations to list, create, and delete notes. Other modules are still in development.

## Run

```bash
npm ci
npm run dev
```

To open the native window, install Rust, Cargo, and the Tauri system dependencies, then run `npx tauri dev`. Port `5173` must be available.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run lint` | Check the code with ESLint |
| `npm run build` | Generate the frontend in `dist/` |
| `npm run preview` | Preview the built frontend |
| `npx tauri build` | Build and package the desktop application |

The notes screen depends on an external server configured in `src/pages/Notes.jsx`. See the [main README](../README.md) for installation, requirements, and the API contract shared with the mobile application.
