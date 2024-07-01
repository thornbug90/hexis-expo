import "dotenv/config";
import { ExpoConfig } from "expo/config";

export default ({ config }: { config: any }): ExpoConfig => ({
  ...config,
  userInterfaceStyle: "automatic",
  name: "Hexis",
  owner: "appliedbehavioursystems",
  slug: "hexis-live",
  version: "2.2.34",
  orientation: "portrait",
  scheme: "hexis",
  icon: "./assets/icon.png",
  platforms: ["ios", "android"],
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#18152D",
  },
  backgroundColor: "#18152D",
  updates: {
    fallbackToCacheTimeout: 0,
    url: "https://u.expo.dev/306f492a-e241-47c9-817f-b5426cc7f006",
  },
  runtimeVersion: "1.0.0",
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "live.hexis.app",
    buildNumber: "85",
    supportsTablet: false,
  },
  android: {
    package: "live.hexis.app",
    versionCode: "85",
    adaptiveIcon: {
      foregroundImage: "./assets/android_foreground_icon.png",
      backgroundImage: "./assets/android_background_icon.png",
    },
    intentFilters: [
      {
        action: "VIEW",
        data: [
          {
            scheme: "hexis",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    // Development
    API_ENDPOINT: "https://graphql-api-backend.onrender.com",
    //API_ENDPOINT: "http://localhost:4000",
    SUPABASE_URL: "https://zbbwlvunazmamwsjhwrv.supabase.co",
    SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiYndsdnVuYXptYW13c2pod3J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU1Njg2MjQsImV4cCI6MjAyMTE0NDYyNH0.MVOcOzeDOJi7m1B9nasrr-R76MxdiRAtCkifdD-tHCQ",
    SHARED_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiYndsdnVuYXptYW13c2pod3J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU1Njg2MjQsImV4cCI6MjAyMTE0NDYyNH0.MVOcOzeDOJi7m1B9nasrr-R76MxdiRAtCkifdD-tHCQ",
    SENTRY_DSN:
      "https://ba9ed86ecba3441bacd1b63babf02bc4@o1146252.ingest.sentry.io/6214758",
    SEGMENT_WRITE_KEY: "kswA2YOGh3EO1CKh9wQvo945CAEbkOPI",
    WEBSITE_URL: "https://dev-hexis-web-app.onrender.com",
    POINT_CLIENT_ID: "d63K0-FVf4COKSXJ3kHmpHGtsp19trcATVPs",
    POINT_CLIENT_SECRET: "PaZyV1199bT65WQpC62angvylBaTugodgu4F",
    ROOK_CLIENT_UUID: "072bc6d0-0016-4329-93b4-002f9d2d61b6",
    ROOK_SECRET_KEY: "1z9eE03If8owh4lM5eVobpAh2Fdi4YQ2t8bG",
    ENVIRONMENT: "staging",

    // Production
    /*     API_ENDPOINT: "https://prod-graphql-api.onrender.com",
    SUPABASE_URL: "https://pddqfcrssmricbmqirye.supabase.co",
    SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkZHFmY3Jzc21yaWNibXFpcnllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NDg0MzI4MiwiZXhwIjoxOTYwNDE5MjgyfQ.xGtc6C5fTHjpTVFPxrEI0OpKpWSNatNA1dTuDilFnT4",
    SHARED_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkZHFmY3Jzc21yaWNibXFpcnllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NDg0MzI4MiwiZXhwIjoxOTYwNDE5MjgyfQ.xGtc6C5fTHjpTVFPxrEI0OpKpWSNatNA1dTuDilFnT4",
    SENTRY_DSN:
      "https://ba9ed86ecba3441bacd1b63babf02bc4@o1146252.ingest.sentry.io/6214758",
    SEGMENT_WRITE_KEY: "BYnN9mYG4Iaq3mERz2SqR5SGwJdioKwD",
    WEBSITE_URL: "https://app.hexis.live",
    POINT_CLIENT_ID: "F-CJUO3qjY9cUWfbVBzK5KT4sFhZqJghQeVO",
    POINT_CLIENT_SECRET: "oIVR_dy1S7M15u0M6Ik5mvKqkgMLr8OUc2Gy",
    ROOK_CLIENT_UUID: "b5844ef9-e692-4b30-9b2a-9d54781734f8",
    ROOK_SECRET_KEY: "2HMCy9KODUGSW1H9SLjQ7cqQSNhdisaR2aGp",
    ENVIRONMENT: "production", */

    eas: {
      projectId: "306f492a-e241-47c9-817f-b5426cc7f006",
    },
  },
  plugins: [
    "react-native-health-connect",
    "sentry-expo",
    "expo-updates",
    [
      "expo-build-properties",
      {
        android: {
          extraMavenRepos: [
            "../../node_modules/@notifee/react-native/android/libs",
          ],
        },
        ios: {},
      },
    ],
  ],
});
