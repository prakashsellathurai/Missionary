import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        emptyOutDir: false, // Don't empty dist, as the main build runs first
        outDir: 'dist',
        lib: {
            entry: resolve(__dirname, 'src/content.ts'),
            name: 'Content',
            fileName: () => 'content.js',
            formats: ['iife'], // Compile to IIFE to inline all dependencies
        },
        rollupOptions: {
            output: {
                extend: true,
            },
        },
    },
});
