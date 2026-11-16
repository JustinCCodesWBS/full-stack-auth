import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: { tsconfigPaths: true },
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: true,
        proxy: {
            '/auth': 'http://127.0.0.1:3001',
            '/drinks': 'http://127.0.0.1:3000',
        },
    },
});
