import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    include: ["scripts/ikeda*.test.ts", "scripts/ikeda*.test.tsx"],
    environment: "node",
    environmentOptions: { jsdom: { url: "http://localhost" } },
  },
});
