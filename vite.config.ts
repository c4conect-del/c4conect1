// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { fileURLToPath } from "node:url";
import type { ConfigEnv } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default (env: ConfigEnv) => defineConfig({
  nitro: env.command === "build" ? { preset: process.env.C4_BUILD_TARGET === "node" ? "node-server" : "cloudflare-module" } : false,
  vite: {
    ssr: { external: ["cloudflare:workers"] },
    build: { rollupOptions: { external: ["cloudflare:workers"] } },
    resolve: { alias: { "c4-runtime": fileURLToPath(new URL(env.command === "build" && process.env.C4_BUILD_TARGET !== "node" ? "./server/cloudflare-runtime.server.ts" : "./server/local-runtime.server.ts", import.meta.url)) } },
    server: {
      fs: { deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "**/data/**", "**/ADMIN-ACCESS.local.md", "**/server/**"] },
    },
  },
})(env);
