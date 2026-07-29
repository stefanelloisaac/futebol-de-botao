import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    environmentMatchGlobs: [['**/src/lib/input/**/*.test.ts', 'jsdom']],
    setupFiles: ['./src/test/setup.ts']
  }
});
