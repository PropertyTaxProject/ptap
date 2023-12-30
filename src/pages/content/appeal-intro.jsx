import React from "react"
import PropTypes from "prop-types"
import { HELP_LINK } from "../../utils"

const AppealIntro = ({ city }) => (
  <>
    <p>
      <b>Disclaimer:</b> Completing this Application does not guarantee that the
      Project will be able to represent you. The information you provide will
      help the Project determine if we can assist you. After completing this
      Application, the Project will try to contact you three times. If we don’t
      hear from you after three attempts, we will remove you from our list.
    </p>
    <h1>The Appeals Process</h1>
    <p>Here is a general overview of the appeals process:</p>

    {city === "detroit" && (
      <ul>
        <li>
          <b>Step 1</b>: Complete this online application by{" "}
          <b>February 15, 2024</b>. If you are unable to complete the
          Application or have questions, plase fill out this form to set up an
          appointment to answer any questions or troubleshoot any issues you
          might have: <a href={HELP_LINK}>Schedule an appointment</a>
        </li>
        <li>
          <b>Step 2</b>: We will review your application, determine if you are
          eligible, and reach out with any questions or further information you
          may need.
        </li>
        <li>
          <b>Step 3</b>: An advocate from our team will submit your documents to
          the March Board of Review by March 8, 2024.
        </li>
        <li>
          <b>Step 4</b>: Before June of 2024, the Board of Review will send you
          a letter notifying you whether your home&apos;s assessed value is
          reduced because of your appeal.
        </li>
      </ul>
    )}
    {city === "chicago" && (
      <ul>
        <li>
          <b>Step 1</b>: Contact the Coalition for Property Tax Justice and work
          with an advocate to complete this Application. If you have questions,
          email us: &nbsp;
          <a href="mailto:chicagoptap@gmail.com?subject=Request for Assistance">
            chicagoptap@gmail.com
          </a>
          .
        </li>
        <li>
          <b>Step 2</b>: Review your eligibility for services with an advocate.
        </li>
        <li>
          <b>Step 3</b>: If your Application is accepted, an advocate will work
          with you to carefully review your application. At this stage, you must
          send your advocate pictures of any repairs your home may need, as this
          can help lower your assessment.
        </li>
        <li>
          <b>Step 4</b>: Your advocate will send your appeal letter to Dentons
          Law Firm. The attorneys at Dentons will contact you to complete and
          file your appeal.
        </li>
        <li>
          <b>Step 5</b>: Dentons will submit your appeal to the Board of Review
          and notify you of the outcome.
        </li>
      </ul>
    )}

    <h2>Who is Eligible for the Project&apos;s Services?</h2>
    <p>You are eligible for services if you meet all of these criteria:</p>

    {city == "detroit" && (
      <ul>
        <li>You own a home in the City of Detroit.</li>
        <li>You occupy that home as your permanent residence.</li>
        <li>Your home is worth $100,000 or less.</li>
      </ul>
    )}
    {city == "chicago" && (
      <ul>
        <li>You own a home in Cook County.</li>
        <li>You occupy that home as your permanent residence.</li>
        <li>Your home is worth $225,000 or less.</li>
      </ul>
    )}
  </>
)

AppealIntro.propTypes = {
  city: PropTypes.string,
}

export default AppealIntro
