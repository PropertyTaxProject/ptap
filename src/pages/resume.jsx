import React, { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AppealContext, AppealDispatchContext } from "../context/appeal"

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
        appeal,
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
