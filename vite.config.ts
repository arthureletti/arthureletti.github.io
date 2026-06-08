import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// ⚠️ Remplace "portfolio-arthur-eletti" par le nom EXACT de ton repo GitHub
export default defineConfig({
  base: '/arthureletti.github.io/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  build: { outDir: 'dist' },
})
