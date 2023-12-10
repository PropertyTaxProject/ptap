import React, { useEffect } from "react"
import { ScrollRestoration, Outlet } from "react-router-dom"
import ReactGA from "react-ga"
import PageLayout from "./layouts/page-layout"

ReactGA.initialize("UA-178459008-2")

export default function App() {
  useEffect(() => {
    ReactGA.pageview(window.location.pathname)
  }, [])

  return (
    <PageLayout>
      <Outlet />
      <ScrollRestoration />
    </PageLayout>
  )
}
