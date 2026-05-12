import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/solitaire-cascade/' : '/',
  build: {
    target: 'es2020',
  },
}));
