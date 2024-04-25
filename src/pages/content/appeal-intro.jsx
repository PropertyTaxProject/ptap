import React from "react"
import { Space } from "antd"
import PropTypes from "prop-types"
import { HELP_LINK } from "../../utils"
import coalition from "../../assets/coalition_logo.png"
import ilo from "../../assets/ilo.png"
import communityAdvocates from "../../assets/community-advocates.jpg"
import uwLaw from "../../assets/uw-law.png"

const AppealIntro = ({ region }) => (
  <>
    <h1>Who We Are</h1>
    {region === "milwaukee" ? (
      <>
        <p>
          Community Advocates, a Milwaukee nonprofit, is working with the
          University of Wisconsin Law School and the Institute for Law and
          Organizing to assist homeowners in appealing their property tax
          assessments.
        </p>
        <p>
          The Institute for Law and Organizing (ILO) is a nonprofit organization
          dedicated to fighting dispossession of Black-owned property. ILO’s
          current campaign is to end property tax injustice.
        </p>
        <p>
          If you want to appeal your property tax assessment, complete the short
          application below.
        </p>
      </>
    ) : (
      <p>
        The Coalition for Property Tax Justice is the current campaign of the
        Institute for Law and Organizing (ILO). We are a nonprofit community
        organization. In addition to Detroit, ILO is working in Milwaukee,
        Chicago, and nationally to end racialized property tax administration in
        America.
      </p>
    )}

    <Space wrap direction="horizontal">
      <img
        src={ilo}
        style={{ height: "80px" }}
        alt="Institute for Law and Organizing logo"
      />

      {region == "milwaukee" ? (
        <>
          <img
            src={communityAdvocates}
            style={{ height: "80px" }}
            alt="Community Advocates logo"
          />
          <img
            src={uwLaw}
            style={{ height: "80px" }}
            alt="University of Wisconsin Law School logo"
          />
        </>
      ) : (
        <img
          src={coalition}
          style={{ height: "80px" }}
          alt="Coalition for Property Tax Justice logo"
        />
      )}
    </Space>
    <br />
    <br />
    <h1>The Appeal Process</h1>
    <p>
      Here is a general overview of the property tax assessment appeal process:
    </p>

    {region === "detroit" && (
      <>
        <ul>
          <li>
            <b>Step 1</b>: Complete our online application by{" "}
            <b>March 1, 2024</b>.
          </li>
          <li>
            <b>Step 2</b>: We will review your application, determine if you are
            eligible, and reach out for any further information we may need.
          </li>
          <li>
            <b>Step 3</b>: Our team will submit your documents to the March
            Board of Review by its deadline, which is March 11, 2024.
          </li>
          <li>
            <b>Step 4</b>: Before June 2024, the Board of Review will send you a
            letter notifying you whether or not you won your appeal.
          </li>
        </ul>
        <p>
          <em>
            If you are unable to complete the application or have questions,
            please set up an appointment:{" "}
            <a target="_blank" rel="noopener noreferrer" href={HELP_LINK}>
              Schedule an appointment
            </a>
          </em>
        </p>
      </>
    )}
    {region === "chicago" && (
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
    {region === "milwaukee" && (
      <ul>
        <li>
          <b>Step 1</b>: Complete our online application by{" "}
          <strong>May 7, 2024</strong>. You can fill this out for yourself, have
          someone help you fill it out for yourself, or help someone else fill
          it out for themselves.
        </li>
        <li>
          <b>Step 2</b>: Community Advocates will review your application,
          determine if you are eligible, and reach out for any further
          information we may need.
        </li>
        <li>
          <b>Step 3</b>: If you are eligible, Community Advocates will refer
          your application to the University of Wisconsin Law School. There, a
          clinical law student supervised by an attorney will review your
          application to determine whether they can file your appeal. If they
          can file your appeal, you will receive free legal representation. Our
          team will submit your appeal, along with any important documents, to
          the Board of Assessors by its deadline, which is May 20, 2024.
        </li>
        <li>
          <b>Step 4</b>: Before October 14, 2024, the Board of Assessors will
          send you a letter notifying you whether or not you won your appeal.
        </li>
      </ul>
    )}

    <h2>Who is Eligible for ILO&apos;s Services?</h2>
    <p>You are eligible for services if you meet all of these criteria:</p>

    {region == "detroit" && (
      <ul>
        <li>You own a home in the City of Detroit;</li>
        <li>
          You occupy that home as your permanent residence (we do not service
          landlords); and
        </li>
        <li>Your home is worth $200,000 or less.</li>
      </ul>
    )}
    {region == "chicago" && (
      <ul>
        <li>You own a home in Cook County.</li>
        <li>
          You occupy that home as your permanent residence (we do not service
          landlords).
        </li>
        <li>Your home is worth $225,000 or less.</li>
      </ul>
    )}
    {region == "milwaukee" && (
      <ul>
        <li>You own a home in the City of Milwaukee;</li>
        <li>
          You occupy that home as your permanent residence (we do not service
          landlords); and
        </li>
        <li>Your home is worth $150,000 or less.</li>
      </ul>
    )}
  </>
)

AppealIntro.propTypes = {
  region: PropTypes.string,
}

export default AppealIntro
