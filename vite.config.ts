import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // The export page imports these lazily. Pre-bundle them so the first export
  // in dev doesn't trigger a dependency re-optimise, which reloads the page and
  // cancels the download.
  optimizeDeps: { include: ['modern-screenshot', 'fflate'] },
})
