import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fixtureMiddleware } from "./preview/fixtures.ts";

// Separate local-only test compiler. Production uses vite.config.ts and real Clerk.
export default defineConfig({
  cacheDir: "node_modules/.vite-studio-preview",
  plugins: [
    react(),
    {
      name: "isolated-studio-preview",
      transformIndexHtml: (html) =>
        html.replace(
          /src="\/src\/main\.tsx(?:\?[^"]*)?"/,
          'src="/tests/preview/main.tsx"',
        ),
      configureServer: (server) => {
        server.middlewares.use(fixtureMiddleware);
      },
    },
  ],
  define: { "import.meta.env.VITE_API_BASE_URL": JSON.stringify("/api") },
  resolve: {
    alias: {
      "@clerk/clerk-react": path.resolve(
        import.meta.dirname,
        "preview/clerk.tsx",
      ),
      "@": path.resolve(import.meta.dirname, "../src"),
    },
  },
  server: { host: "127.0.0.1", port: 5180, strictPort: true },
});
