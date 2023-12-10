import React from "react"
import { Routes, Route } from "react-router-dom"
import HomeownerInfo from "./steps/homeowner-info"
import ReviewProperty from "./steps/review-property"
import ReviewComparables from "./steps/review-comparables"
import ReviewAppeal from "./steps/review-appeal"
import AppealLookup from "./steps/appeal-lookup"
import FinalPage from "./final-page"

// TODO: uuid
const Appeal = () => {
  /*
  Appeal has a series of pages viewed in seq order
  
  1) Eligibility Requirements (Default): Find pin and sets uuid
  2) Contact Info: Collects Contact Info
  3) Review Property: Review Selected Property Information
  4) Comparables: Select Comparables
  5) Review Appeal: Review Appeal
  */

  // TODO: Run loading of data on hook rather than on click
  return (
    <Routes>
      <Route path="/" element={<AppealLookup />} />
      <Route path="homeowner-info" element={<HomeownerInfo />} />
      <Route path="review-property" element={<ReviewProperty />} />
      <Route path="comparables" element={<ReviewComparables />} />
      <Route path="review-appeal" element={<ReviewAppeal />} />
      <Route path="complete" element={<FinalPage />} />
    </Routes>
  )
}

export default Appeal
