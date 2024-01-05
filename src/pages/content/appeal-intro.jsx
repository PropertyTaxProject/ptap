import React from "react"
import { Space } from "antd"
import PropTypes from "prop-types"
import { HELP_LINK } from "../../utils"
import coalition from "../../assets/coalition_logo.png"
import ilo from "../../assets/ilo.png"

const AppealIntro = ({ city }) => (
  <>
    <h1>Who We Are</h1>
    <p>
      The Coalition for Property Tax Justice is the current campaign of the
      Institute for Law and Organizing (ILO). We are a non-profit community
      organization. In addition to Detroit, ILO is working in Milwaukee,
      Chicago, and nationally to end racialized property tax administration in
      America.
    </p>
    <Space wrap direction="horizontal">
      <img
        src={ilo}
        style={{ height: "80px" }}
        alt="Institute for Law and Organizing logo"
      />
      <img
        src={coalition}
        style={{ height: "80px" }}
        alt="Coalition for Property Tax Justice logo"
      />
    </Space>
    <br />
    <br />
    <h1>The Appeal Process</h1>
    <p>
      Here is a general overview of the property tax assessment appeal process
    </p>

    {city === "detroit" && (
      <>
        <ul>
          <li>
            <b>Step 1</b>: Complete this online application by{" "}
            <b>March 1, 2024</b>.
          </li>
          <li>
            <b>Step 2</b>: We will review your application, determine if you are
            eligible, and reach out with any questions or further information
            you may need.
          </li>
          <li>
            <b>Step 3</b>: Our team will submit your documents to the March
            Board of Review by the deadline on March 11, 2024.
          </li>
          <li>
            <b>Step 4</b>: Before June 2024, the Board of Review will send you a
            letter notifying you whether it has reduced your home&apos;s
            assessed value because of your appeal.
          </li>
        </ul>
        <p>
          <em>
            If you are unable to complete the application or have questions,
            please set up an appointment to answer any questions or troubleshoot
            any issues you might have:{" "}
            <a target="_blank" rel="noopener noreferrer" href={HELP_LINK}>
              Schedule an appointment
            </a>
          </em>
        </p>
      </>
    )}
    {city === "chicago" && (
      <ul>
        <li>
          <b>Step 1</b>: Contact the Coalition for Property Tax Justice and work
          with an advocate to complete this application. If you have questions,
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
          <b>Step 3</b>: If your application is accepted, an advocate will work
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

    <h2>Who is Eligible for ILO&apos;s Services?</h2>
    <p>You are eligible for services if you meet all of these criteria:</p>

    {city == "detroit" && (
      <ul>
        <li>You own a home in the City of Detroit.</li>
        <li>
          You occupy that home as your permanent residence (we do not service
          landlords).
        </li>
        <li>Your home is worth $100,000 or less.</li>
      </ul>
    )}
    {city == "chicago" && (
      <ul>
        <li>You own a home in Cook County.</li>
        <li>
          You occupy that home as your permanent residence (we do not service
          landlords).
        </li>
        <li>Your home is worth $225,000 or less.</li>
      </ul>
    )}
  </>
)

AppealIntro.propTypes = {
  city: PropTypes.string,
}

export default AppealIntro
