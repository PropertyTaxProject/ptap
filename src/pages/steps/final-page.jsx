import React, { useContext } from "react"
import { AppealContext } from "../../context/appeal"

const FinalPage = () => {
  const appeal = useContext(AppealContext)
  return (
    <>
      <h1>Your appeal has now been submitted.</h1>
      {appeal.region === "detroit" && (
        <>
          <p>Your appeal letter has now been submitted.</p>
          <h2>What to expect next</h2>
          <p>
            You will receive an email with your appeal letter and verification
            that your appeal letter was submitted to the March Board of Review.
            Be on the lookout for the Board of Review’s scheduling date for your
            hearing.
          </p>
          <p>
            In the meantime, if you have any questions, you can send us an email
            at: ptap@lawandorganizing.org or 313-438-8698.
          </p>
          <p>
            We do not represent you and you are responsible for any further
            action related to your appeal, including attending the hearing and
            providing the City of Detroit with any other information that they
            may request. You can always contact us with questions, although we
            cannot provide you with legal advice or representation.
          </p>
        </>
      )}
      {appeal.region === "milwaukee" && (
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
