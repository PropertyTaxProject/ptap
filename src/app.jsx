import React, { useEffect } from "react"
import { ScrollRestoration, Outlet } from "react-router-dom"
import ReactGA from "react-ga4"
import PageLayout from "./layouts/page-layout"

ReactGA.initialize("G-3TNFXQP57P")

export default function App() {
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname })
  }, [])

  return (
    <PageLayout>
      <Outlet />
      <ScrollRestoration />
    </PageLayout>
  )
}
