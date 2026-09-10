# Central

A desktop application in development that brings personal productivity, routines,
and organization tools together in one place.

## Current Status

Central currently provides an initial interface with sidebar navigation. Selecting
a section updates the page heading and placeholder content. Individual modules
and data persistence are not implemented yet.

The sidebar includes Home, Notes, Tasks, Reminders, Calendar, Goals, Workouts,
Studies, Screen Time, Addiction Tracking, Journal, Sleep, PC Control, and Darly.
The application interface currently uses Portuguese labels.

## Tech Stack

- React 19 for the user interface.
- Vite 8 for frontend development and production builds.
- Tauri 2 and Rust for the desktop application.
- CSS for styling and ESLint for JavaScript static analysis.

## Requirements

- Node.js 20.19+ within the 20.x release line, or Node.js 22.12+; npm.
- For desktop development and builds: Rust, Cargo, and the Tauri system dependencies for your operating system.

## Installation

```bash
git clone https://github.com/Joaquimkoster/Central.git
cd Central/central-desktop
npm ci
```

## Development

Run all commands below from the `central-desktop` directory.

### Browser

```bash
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

### Desktop

```bash
npx tauri dev
```

Tauri starts the frontend development server automatically. The desktop
configuration expects `http://localhost:5173`, so keep port `5173` available
before starting this command.

## Builds and Checks

| Command | Purpose |
| --- | --- |
| `npm run build` | Build the frontend into `dist/`. |
| `npm run preview` | Preview an existing frontend build locally. |
| `npm run lint` | Run ESLint static analysis. |
| `npx tauri build` | Build and package the desktop application. |

The desktop build runs the frontend build automatically. Desktop bundles are
generated under `src-tauri/target/release/bundle/`, depending on the platform
and installed build tools.

## Project Structure

```text
Central/
|-- README.md
`-- central-desktop/
    |-- public/          # Static assets
    |-- src/             # React interface and styles
    |-- src-tauri/       # Rust code, icons, and desktop configuration
    |-- package.json     # Frontend dependencies and scripts
    `-- vite.config.js   # Vite configuration
```

Installed dependencies and generated files (`node_modules/`, `dist/`, and
`src-tauri/target/`) are excluded from version control.
