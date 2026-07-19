import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '#components': resolve(root, 'src/components'),
      '#content': resolve(root, 'src/content'),
      '#hooks': resolve(root, 'src/hooks'),
      '#pages': resolve(root, 'src/pages'),
      '#store': resolve(root, 'src/store'),
    },
  },
})
