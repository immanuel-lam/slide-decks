import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/browser',
  use: { baseURL: 'http://127.0.0.1:5211', viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' },
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 5211', url: 'http://127.0.0.1:5211', reuseExistingServer: !process.env.CI },
})
