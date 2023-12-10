import "antd/dist/antd.min.css"
import "./index.css"
import React from "react"
import { createRoot } from "react-dom/client"
import App from "./app"
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"
import AppealLookup from "./pages/steps/appeal-lookup"
import SelectRegion from "./pages/select-region"
import FinalPage from "./pages/final-page"
import { AppealProvider } from "./context/appeal"
import HomeownerInfo from "./pages/steps/homeowner-info"
import ReviewProperty from "./pages/steps/review-property"
import ReviewComparables from "./pages/steps/review-comparables"
import ReviewAppeal from "./pages/steps/review-appeal"
import NotFound from "./pages/not-found"

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
    path: "review-property",
    element: <ReviewProperty />,
  },
  {
    path: "comparables",
    element: <ReviewComparables />,
  },
  {
    path: "review-appeal",
    element: <ReviewAppeal />,
  },
  {
    path: "complete",
    element: <FinalPage />,
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
          <AppealProvider city="detroit">
            <Outlet />
          </AppealProvider>
        ),
        children: appealRoutes,
      },
      {
        path: "/cook/*",
        element: (
          <AppealProvider city="chicago">
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
