import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
           '@': path.resolve(__dirname, 'src'),
            '@app': path.resolve(__dirname, 'src/app'),
            '@flow': path.resolve(__dirname, 'src/flow'),
            '@execution': path.resolve(__dirname, 'src/execution'),
            '@containers': path.resolve(__dirname, 'src/containers'),
            '@logic': path.resolve(__dirname, 'src/logic'),
            '@data': path.resolve(__dirname, 'src/data'),
            '@shared': path.resolve(__dirname, 'src/shared'),
        },
    },
    test: {
        globals: true,
        coverage: {
            reporter: ['text', 'html'],
        },
    },
});
