# Central Mobile

The Central mobile application uses Expo SDK 57, React Native 0.86, React 19, Expo Router, and TypeScript. It includes a home screen and API operations to list, create, and delete notes, with native Home (Início) and Notes (Notas) tabs. Other modules are in development; web navigation still contains elements from the Expo template.

## Run

```bash
npm ci
npm start
```

| Command | Purpose |
| --- | --- |
| `npm run android` | Start Expo and open on Android |
| `npm run ios` | Start Expo and open in the iOS simulator (macOS) |
| `npm run web` | Run in the browser |
| `npx tsc --noEmit` | Check types |
| `npx expo export --platform web` | Export the web version to `dist/` |

The `npm run lint` script is available, but ESLint configuration still needs to be added. The `reset-project` script is a template utility that moves the starter code; it is not required to run Central.

Routes are located in `src/app/`. The notes API is configured through the `API_URL` constant in `src/app/notes.tsx`. The backend must be reachable from the device being used and is not included in this project. Offline storage and real-time updates are not implemented.

See the [main README](../README.md) for requirements and the API contract shared with the desktop application.
