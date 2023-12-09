import "antd/dist/antd.min.css"
import "./index.css"
import React, { useEffect } from "react"
import { createRoot } from "react-dom/client"
import { Layout } from "antd"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import ReactGA from "react-ga"

import Header from "./components/header"
import Appeal from "./pages/appeal"
import SelectRegion from "./pages/select-region"
import FinalPage from "./pages/final-page"
import Reduced2023 from "./pages/reduced2023"

const { Content, Footer } = Layout

// TODO: Set up google analytics again, events
/* google analytics */
// ReactGA.initialize("UA-178459008-2")
// const history = createBrowserHistory()
// history.listen((location) => {
//   ReactGA.set({ page: location.pathname })
//   ReactGA.pageview(location.pathname)
// })

const Page = () => {
  useEffect(() => {
    ReactGA.pageview(window.location.pathname)
  }, [])
  return (
    <Router history={history}>
      <Layout className="layout">
        <Header />
        <Content style={{ padding: "0 3vw" }}>
          <div className="site-layout-content">
            <Routes>
              <Route path="/" element={<SelectRegion />} />
              <Route path="/detroit" element={<Reduced2023 />} />
              <Route path="/detroit2023" element={<Reduced2023 />} />
              <Route
                path="/internaldetroitappeal"
                element={<Appeal city="detroit" />}
              />
              <Route path="/cook" element={<Appeal city="chicago" />} />
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
    </Router>
  )
}

const root = createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>
)
