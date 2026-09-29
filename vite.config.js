import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // the film frames live in public/ and are copied verbatim; nothing else
    // is big enough to need splitting
    assetsInlineLimit: 4096,
  },
});
