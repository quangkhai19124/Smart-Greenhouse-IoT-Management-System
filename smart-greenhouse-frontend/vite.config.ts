import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, ConfigEnv } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite'
const projectRootDir = resolve(__dirname);

export default ({ mode }: ConfigEnv) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  const {
    PORT,
    API_BASE_URL,
    MODE,
    API_PROXY_NAME
  } = process.env;

  return defineConfig({
    plugins: [react(),  tailwindcss()],
    resolve: {
      alias: {
        '@': resolve(projectRootDir, 'src'),
      },
    },

    server: {
      port: Number(PORT),
      proxy: {
        '/api-proxy/': {
          target: API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => {
            return path.replace(/^\/api-proxy/, '/');
          },
        }
      }
    } ,


    define: {
      'import.meta.env.MODE': JSON.stringify(MODE),
      'import.meta.env.PORT': JSON.stringify(PORT),
      'import.meta.env.API_BASE_URL': JSON.stringify(API_BASE_URL),
      'import.meta.env.API_PROXY_NAME': JSON.stringify(API_PROXY_NAME)
    },
  });
};
