import { Liveblocks } from "@liveblocks/node";

const globalForLiveblocks = globalThis as unknown as {
  liveblocks: Liveblocks | undefined;
};

export const liveblocks =
  globalForLiveblocks.liveblocks ??
  new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY || "sk_mock_secret_key_for_build",
  });

if (process.env.NODE_ENV !== "production") {
  globalForLiveblocks.liveblocks = liveblocks;
}

// A fixed palette of 8 vivid, modern colors suitable for dark-mode cursor presentation
const CURSOR_COLORS = [
  "#FF5733", // Vivid Red-Orange
  "#FFC300", // Bright Gold-Yellow
  "#33FF57", // Neon Green
  "#33FFF6", // Electric Cyan
  "#3357FF", // Cobalt Blue
  "#8A33FF", // Neon Violet
  "#FF33F6", // Shocking Magenta
  "#FF3380", // Vibrant Rose
];

/**
 * Deterministically maps a user ID to a consistent color from a fixed palette.
 */
export function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CURSOR_COLORS.length;
  return CURSOR_COLORS[index];
}
