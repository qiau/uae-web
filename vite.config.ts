import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    server: {
      // The backend has no CORS middleware, so browser calls stay same-origin,
      // exactly like the Next.js pass-through route in the source app.
      proxy: {
        "/api": {
          target: env.VITE_DEV_API_TARGET || "http://127.0.0.1:8000",
          changeOrigin: false,
        },
      },
    },
  };
});
