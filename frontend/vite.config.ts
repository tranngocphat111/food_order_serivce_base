import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiGatewayUrl = env.VITE_API_GATEWAY_URL

  return {
    plugins: [react(), tsconfigPaths()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/api': {
          target: apiGatewayUrl,
          changeOrigin: true,
        },
        '/foods': {
          target: apiGatewayUrl,
          changeOrigin: true,
        },
        '/orders': {
          target: apiGatewayUrl,
          changeOrigin: true,
        },
        '/payments': {
          target: apiGatewayUrl,
          changeOrigin: true,
        },
      },
    },
  }
})