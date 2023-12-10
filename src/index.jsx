import "antd/dist/antd.min.css"
import "./index.css"
import React from "react"
import { createRoot } from "react-dom/client"
import App from "./app"

const root = createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
