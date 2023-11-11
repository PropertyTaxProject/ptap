import { defineConfig, splitVendorChunkPlugin } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  base: process.env.VITE_PUBLIC_URL || "/",
  plugins: [react(), splitVendorChunkPlugin()],
})
