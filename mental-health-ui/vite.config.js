import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 1. Matches your GitHub repo name for correct asset pathing
  base: '/mood-tracker-ai/', 

  plugins: [
    vue()
  ],

  resolve: {
    alias: {
      // 2. Allows you to use '@' as a shortcut for the 'src' folder
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },

  build: {
    // 3. Ensures the build output folder matches your 'gh-pages' deploy script
    outDir: 'dist',
    // 4. Cleans the old folder before building new files to prevent 'ghost' errors
    emptyOutDir: true 
  }
})