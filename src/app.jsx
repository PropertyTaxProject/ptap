import React, { useEffect } from "react"
import { Layout } from "antd"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import ReactGA from "react-ga"

import Header from "./components/header"
import Appeal from "./pages/appeal"
import SelectRegion from "./pages/select-region"
import FinalPage from "./pages/final-page"
import Reduced2023 from "./pages/reduced2023"
import { AppealProvider } from "./context/appeal"

const { Content, Footer } = Layout

ReactGA.initialize("UA-178459008-2")

export default function App() {
  useEffect(() => {
    ReactGA.pageview(window.location.pathname)
  }, [])
  return (
    <BrowserRouter>
      <Layout className="layout">
        <Header />
        <Content style={{ padding: "0 3vw" }}>
          <div className="site-layout-content">
            <Routes>
              <Route path="/" element={<SelectRegion />} />
              <Route path="/detroit" element={<Reduced2023 />} />
              <Route path="/detroit2023" element={<Reduced2023 />} />
              <Route
                path="/internaldetroitappeal/*"
                element={
                  <AppealProvider city="detroit">
                    <Appeal />
                  </AppealProvider>
                }
              />
              <Route
                path="/cook/*"
                element={
                  <AppealProvider city="chicago">
                    <Appeal city="chicago" />
                  </AppealProvider>
                }
              />
              <Route path="/completedappeal" element={<FinalPage />} />
              <Route
                path="/illegalforeclosures"
                component={() => {
                  window.location.href = "https://illegalforeclosures.org/"
                  return null
                }}
              />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Call 313-438-8698 with any questions. Please leave a message if we
          don&apos;t pick up and we will return your call within 48 hours.
        </Footer>
      </Layout>
    </BrowserRouter>
  )
}
