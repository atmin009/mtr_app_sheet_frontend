import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
  tailwindcss()],
  server: {
    // ✅ เพิ่มบรรทัดนี้: อนุญาตให้เข้าผ่าน Host ไหนก็ได้ (Cloudflare/Ngrok)
    allowedHosts: true, 
    
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
