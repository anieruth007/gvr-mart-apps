import { Platform } from 'react-native';

// When true, no network calls are made at all — every request is answered by an in-memory
// mock backend (see mockData.ts) seeded with realistic data. Used for offline demo builds.
export const OFFLINE_DEMO = process.env.EXPO_PUBLIC_OFFLINE_DEMO === 'true';

// Android emulators reach the host machine via 10.0.2.2, not localhost; web (and iOS simulator)
// can use localhost directly. On a physical device, point this at your machine's LAN IP instead
// (e.g. http://192.168.1.20:3000/api/v1) via EXPO_PUBLIC_API_URL.
const DEFAULT_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/v1' : 'http://localhost:3000/api/v1';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_URL;
