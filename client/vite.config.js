// Vite builds and serves the React app. Port 5176 so it can run next to the
// other projects (5173-5175).
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5176 },
  preview: { port: 5176 },
});
