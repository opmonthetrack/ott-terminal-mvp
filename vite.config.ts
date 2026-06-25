import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // ⚡ DEZE REGEL ZET DE POORTEN OPEN VOOR JE TELEFOON
    proxy: {
      '/xaman-api': {
        target: 'https://xumm.app/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/xaman-api/, '')
      }
    }
  }
})