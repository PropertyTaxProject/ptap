import { defineConfig, splitVendorChunkPlugin } from "vite"
import react from "@vitejs/plugin-react"
import { sentryVitePlugin } from "@sentry/vite-plugin"

export default defineConfig({
  base: process.env.VITE_PUBLIC_URL || "/",
  build: { sourcemap: true },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: { "font-size-base": "16px" },
        javascriptEnabled: true,
      },
    },
  },
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    sentryVitePlugin({
      org: "ptap",
      project: "ptap",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
})
