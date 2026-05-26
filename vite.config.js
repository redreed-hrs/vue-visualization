import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081',   // 你的后端地址
        changeOrigin: true,
        // 如果后端接口路径没有额外前缀，不需要 rewrite
        // rewrite: (path) => path
      }
    }
  }
})