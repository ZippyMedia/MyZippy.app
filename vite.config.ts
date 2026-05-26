import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Custom plugin to safely copy public dir, skipping unreadable files
function safePublicPlugin() {
  return {
    name: 'safe-public-copy',
    apply: 'build' as const,
    closeBundle() {
      const publicDir = path.resolve(__dirname, 'public');
      const distDir = path.resolve(__dirname, 'dist');
      const files = fs.readdirSync(publicDir);
      for (const file of files) {
        const src = path.join(publicDir, file);
        const dest = path.join(distDir, file);
        try {
          fs.accessSync(src, fs.constants.R_OK);
          if (!fs.existsSync(dest)) {
            fs.copyFileSync(src, dest);
          }
        } catch {
          // skip unreadable files
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), safePublicPlugin()],
  publicDir: 'public',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
