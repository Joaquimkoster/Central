# Central

Central is a personal organization project with **desktop and mobile applications** and a Portuguese user interface. It provides access to notes and planned modules for tasks, routines, studies, and goals.

## Current Status

- **Desktop:** home dashboard, sidebar navigation, and a notes screen with listing, creation, and deletion.
- **Mobile:** home screen with module shortcuts and a notes screen with listing, creation, deletion, and a loading indicator. Native navigation includes Home (Início) and Notes (Notas) tabs.
- Both applications use the same notes API. Data loads when the screen opens; real-time synchronization and offline storage are not implemented.
- Other modules are still initial interfaces or inactive options. The mobile application's web version retains some navigation from the Expo template.

## Project Structure

```text
Central/
├── README.md
├── central-desktop/          # React, Vite, and Tauri
│   ├── src/                  # Interface, components, and pages
│   ├── public/               # Static files
│   └── src-tauri/            # Rust code and desktop configuration
└── central-mobile/           # React Native, Expo, and TypeScript
    ├── src/app/              # Expo Router routes
    ├── src/components/       # UI components
    ├── assets/               # Images and icons
    └── app.json              # Expo configuration
```

Each application has its own `package.json` and `package-lock.json`; install dependencies separately.

## Technologies and Requirements

| Application | Technologies |
| --- | --- |
| Desktop | React 19, Vite 8, Tauri 2, and Rust |
| Mobile | Expo SDK 57, React Native 0.86, React 19, Expo Router, and TypeScript |

Use Node.js 24 LTS and npm. Running or packaging the desktop application with Tauri also requires Rust, Cargo, and the Tauri system dependencies for your operating system. For native mobile development, use a device or emulator with an environment compatible with the installed Expo SDK; the iOS simulator requires macOS and Xcode.

## Installation

```bash
git clone https://github.com/Joaquimkoster/Central.git
cd Central
```

### Desktop

```bash
cd central-desktop
npm ci
npm run dev
```

Open the address printed by Vite. To launch the native window, run `npx tauri dev` from the same directory. Tauri starts Vite automatically and expects port `5173` to be available.

### Mobile

In another terminal, starting from the repository root:

```bash
cd central-mobile
npm ci
npm start
```

Use the options displayed by Expo to open the application in your available environment.

| Command in `central-mobile/` | Purpose |
| --- | --- |
| `npm run android` | Start Expo and open on Android |
| `npm run ios` | Start Expo and open in the iOS simulator |
| `npm run web` | Start the web version |
| `npx tsc --noEmit` | Check TypeScript types |

## Notes API

The backend is **not included in this project directory**. Both clients are configured to use `http://100.71.224.93:8080/api/notes`, which must be reachable from the computer or device running the application.

To use another server, update the address in:

- `central-desktop/src/pages/Notes.jsx` (listing, creation, and deletion requests).
- `central-mobile/src/app/notes.tsx` (the `API_URL` constant).

API contract expected by the clients:

| Method | Route | Expected Behavior |
| --- | --- | --- |
| `GET` | `/api/notes` | Return a list of notes with `id`, `title`, and `content` |
| `POST` | `/api/notes` | Accept JSON with `title` and `content` and return the created note |
| `DELETE` | `/api/notes/:id` | Delete the note and return a successful response |

The mobile application types `id` as a number. The server must allow requests from the origins used by web clients. When the backend is unreachable, the screens still open, but note operations do not work.

## Checks and Builds

Run inside `central-desktop/`:

```bash
npm run lint
npm run build
npx tauri build
```

`npm run build` generates the frontend in `dist/`; `npm run preview` lets you preview it. `npx tauri build` also builds the frontend and generates native packages in `src-tauri/target/release/bundle/`, depending on the platform.

For mobile, `npx tsc --noEmit` checks types and `npx expo export --platform web` exports the web version to `dist/`. The `npm run lint` script is available, but ESLint configuration has not been added yet. No EAS distribution configuration is included.

The repository tracks source code, configuration, assets, and lockfiles. Installed dependencies, caches, local credentials, and build artifacts are ignored.
