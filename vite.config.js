import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  cacheDir: join(tmpdir(), 'mundo-mini-vite-cache'),
})
