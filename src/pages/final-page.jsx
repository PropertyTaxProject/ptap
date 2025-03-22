import React, { useContext } from "react"
import { AppealContext } from "../context/appeal"

const FinalPage = () => {
  const appealCtx = useContext(AppealContext)
  return (
    <>
      <h1>Your application has now been submitted.</h1>

      <h2>What to expect next</h2>
      {appealCtx.region === "detroit" && (
        <p>
          Our team will contact you before our March 5th deadline. In the
          meantime, if you have any questions, you can send us an email at:{" "}
          <a href="mailto:ptap@lawandorganizing.org">
            ptap@lawandorganizing.org
          </a>{" "}
          or 313-438-8698.
        </p>
      )}
      {appealCtx.region === "milwaukee" && (
        <p>
          Our team will contact you before our May 19th deadline. In the
          meantime, if you have any questions, you can send us an email at:{" "}
          <a href="mailto:stopforeclosure@communityadvocates.net">
            stopforeclosure@communityadvocates.net
          </a>{" "}
          or 414-517-3071.
        </p>
      )}
    </>
  )
}

export default FinalPage
