import { defineConfig, splitVendorChunkPlugin } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  base: process.env.VITE_PUBLIC_URL || "/",
  plugins: [react(), splitVendorChunkPlugin()],
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: { "font-size-base": "16px" },
        javascriptEnabled: true,
      },
    },
  },
})
