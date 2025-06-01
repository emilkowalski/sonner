import { defineConfig, type Plugin } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.tsx',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      // https://github.com/vitejs/vite/issues/15012#issuecomment-1816102409
      onwarn(warning, defaultHandler) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) {
          return;
        }
        defaultHandler(warning);
      },
    },
    emptyOutDir: false,
  },
});
