import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const bridgeDir = dirname(fileURLToPath(import.meta.url));
const rootEnv = resolve(bridgeDir, "..", ".env");
const bridgeEnv = resolve(bridgeDir, ".env");

dotenv.config({
  path: existsSync(bridgeEnv) ? bridgeEnv : rootEnv,
  quiet: true,
});

export const SERIAL_PORT = process.env.SERIAL_PORT || "COM3";
export const BAUD_RATE = Number(process.env.BAUD_RATE || 115200);
export const MOCK_SERIAL = process.env.MOCK_SERIAL !== "false";
export const DEBUG_SERIAL = process.env.DEBUG_SERIAL === "true";
export const DEBUG_GESTURES = process.env.DEBUG_GESTURES === "true";
export const WS_PORT = Number(process.env.WS_PORT || 8080);
export const EKSTRA_API_KEY = process.env.EKSTRA_API_KEY;
export const EKSTRA_BASE_URL =
  process.env.EKSTRA_BASE_URL || "https://ekstra.ai";
export const EKSTRA_PHONE_IMU_ENABLED =
  process.env.EKSTRA_PHONE_IMU_ENABLED === "true";
export const EKSTRA_PHONE_IMU_INGEST_URL =
  process.env.EKSTRA_PHONE_IMU_INGEST_URL ||
  `${EKSTRA_BASE_URL}/api/phone-imu/ingest`;
export const EKSTRA_PHONE_IMU_HEALTH_URL =
  process.env.EKSTRA_PHONE_IMU_HEALTH_URL ||
  `${EKSTRA_BASE_URL}/api/phone-imu/health`;
export const EKSTRA_CLOUD_WS_ENABLED =
  process.env.EKSTRA_CLOUD_WS_ENABLED === "true";
export const EKSTRA_CLOUD_WS_URL =
  process.env.EKSTRA_CLOUD_WS_URL || "wss://ekstra.ai/ws";

export const THRESHOLDS = {
  verticalGesture: 4,
  horizontalGesture: 4,
  gestureNeutral: 1.6,
  axisDominance: 1.05,
  gestureCooldown: 650,
};
