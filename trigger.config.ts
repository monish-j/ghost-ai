import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: process.env.
    TRIGGER_PROJECT_REF!, // Replace with your real project reference from the Trigger.dev dashboard
  runtime: 'node',
  dirs: ["./trigger"],
  maxDuration: 3600,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      factor: 2,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      randomize: true,
    },
  },
});
