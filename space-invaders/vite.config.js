import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Esto permite que Vite escuche en todas las interfaces de red
    port: 5173, // puerto que quieras usar (opcional)
  },
});
