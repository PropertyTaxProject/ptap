import React, { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AppealContext, AppealDispatchContext } from "../context/appeal"

const cleanEligibility = (eligibility) =>
  Object.entries(eligibility).reduce(
    (acc, curr) => ({
      ...acc,
      [curr[0]]: typeof curr[1] === "string" ? curr[1] === "Yes" : curr[1],
    }),
    {}
  )

const cleanAppeal = (appeal) => {
  return {
    ...appeal,
    step: 1,
    pin: appeal?.target_pin?.pin || appeal?.pin,
    target: appeal?.target_pin || appeal?.target,
    eligibility: cleanEligibility(appeal.eligibility || {}),
    selected_comparables:
      appeal?.selectedComparables || appeal?.selected_comparables,
    search_properties: appeal?.propertyOptions || appeal?.search_properties,
    property: appeal?.property,
  }
}

const Resume = () => {
  const appealCtx = useContext(AppealContext)
  const dispatch = useContext(AppealDispatchContext)
  const navigate = useNavigate()

  useEffect(() => {
    const dataStr = document.getElementById("frontend-props").innerText
    try {
      const appeal = JSON.parse(dataStr)
      dispatch({
        type: "resume",
        appeal: cleanAppeal(appeal),
        region: appealCtx.region,
      })
    } catch (e) {
      console.error(e)
    }
    navigate("../")
  }, [])

  return <h1>Redirecting...</h1>
}

export default Resume
