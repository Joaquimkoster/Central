# Central Desktop

The React and Vite frontend and Tauri 2 desktop application for Central.
The current implementation provides sidebar navigation and placeholder pages;
individual module features and data persistence are not implemented yet.

## Development

From this directory, install dependencies and start the browser version:

```bash
npm ci
npm run dev
```

To run the desktop application, install Rust, Cargo, and the Tauri system
dependencies for your platform, then run:

```bash
npx tauri dev
```

Tauri starts Vite automatically and expects port `5173` to be available.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run build` | Build the frontend into `dist/`. |
| `npm run preview` | Preview the frontend build locally. |
| `npm run lint` | Run ESLint. |
| `npx tauri build` | Build and package the desktop application. |

See the [main README](../README.md) for requirements, project structure, and current status.
