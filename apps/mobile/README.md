# Atena Mobile App

This is the React Native + Expo mobile application for **Atena School** built using Expo SDK 57 and React Native 0.86.

## Technologies
- Expo SDK 57
- React Native 0.86
- TypeScript

## Local Development

From the monorepo root, you can run:

```bash
# Start the Expo developer server
npx pnpm --filter mobile dev
```

Or navigate to this directory (`apps/mobile`) and run:

```bash
# Run on Android emulator
npx expo start --android

# Run on iOS simulator
npx expo start --ios

# Run in Web browser
npx expo start --web
```
