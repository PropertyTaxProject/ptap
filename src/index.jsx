import "antd/dist/antd.less"
import "./index.css"
import React from "react"
import { createRoot } from "react-dom/client"
import App from "./app"
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"
import * as Sentry from "@sentry/react"
import AppealLookup from "./pages/steps/appeal-lookup"
import SelectRegion from "./pages/select-region"
import FinalPage from "./pages/final-page"
import { AppealProvider } from "./context/appeal"
import HomeownerInfo from "./pages/steps/homeowner-info"
import ReviewProperty from "./pages/steps/review-property"
import ReviewComparables from "./pages/steps/review-comparables"
import ReviewAppeal from "./pages/steps/review-appeal"
import NotFound from "./pages/not-found"
import Agreement from "./pages/steps/agreement"
import Damage from "./pages/steps/damage"
import Resume from "./pages/resume"

if (import.meta.env.PROD) {
  // Could move to configuration, but not sensitive and will be on client side
  Sentry.init({
    dsn: "https://b8a640bb5e1b226438d5c61550608d0f@o86794.ingest.sentry.io/4506107981529088",
    environment:
      window.location.host === "app.propertytaxproject.com" ? "prod" : "dev",
  })
}

const appealRoutes = [
  {
    path: "",
    index: true,
    element: <AppealLookup />,
  },
  {
    path: "homeowner-info",
    element: <HomeownerInfo />,
  },
  {
    path: "agreement",
    element: <Agreement />,
  },
  {
    path: "review-property",
    element: <ReviewProperty />,
  },
  {
    path: "comparables",
    element: <ReviewComparables />,
  },
  {
    path: "damage",
    element: <Damage />,
  },
  {
    path: "review-appeal",
    element: <ReviewAppeal />,
  },
  {
    path: "complete",
    element: <FinalPage />,
  },
  {
    path: "resume",
    element: <Resume />,
  },
]

const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <SelectRegion />,
      },
      {
        path: "/detroit/*",
        element: (
          <AppealProvider region="detroit">
            <Outlet />
          </AppealProvider>
        ),
        children: appealRoutes,
      },
      {
        path: "/cook/*",
        element: (
          <AppealProvider region="chicago">
            <Outlet />
          </AppealProvider>
        ),
        children: appealRoutes,
      },
      {
        path: "/milwaukee/*",
        element: (
          <AppealProvider region="milwaukee">
            <Outlet />
          </AppealProvider>
        ),
        children: appealRoutes,
      },
      {
        path: "/completedappeal",
        element: <FinalPage />,
      },
    ],
  },
])

const root = createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
