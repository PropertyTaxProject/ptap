import React from "react"
import { Space } from "antd"
import PropTypes from "prop-types"
import { HELP_LINK } from "../../utils"
import coalition from "../../assets/coalition_logo.png"
import ilo from "../../assets/ilo.png"
import communityAdvocates from "../../assets/community-advocates.jpg"
import uwLaw from "../../assets/uw-law.png"
import { DETROIT_PHONE } from "../../utils"

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
      <>
        <p>
          The Angela B. Wilson Property Tax Appeal Project helps Detroit
          homeowners determine whether the City of Detroit has illegally
          inflated their property taxes. You can use this application to help
          you create and file your own property tax assessment appeal.
        </p>
        <p>
          <strong>
            Please note that this application helps you draft and file your own
            appeal. The Institute for Law & Organizing and the Coalition for
            Property Tax Justice are not providing you with legal advice or
            representation.
          </strong>
        </p>
        <p>Call {DETROIT_PHONE} with any questions.</p>
      </>
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
    {region === "detroit" && (
      <>
        <p>
          Thanks to the people who have been building power with the Coalition
          for Property Tax Justice, the City of Detroit simplified the property
          tax appeals process. You can now appeal your property taxes to the
          March Board of Review.
        </p>
        <ul>
          <li>
            <b>Step 1</b>: Complete this online application.
            <ul>
              <li>
                To strengthen your appeal, you can submit photos of any home
                damage through this application. To include photos, please have
                them saved on your computer or cell phone before starting.
              </li>
            </ul>
          </li>
          <li>
            <b>Step 2</b>: File your appeal with the March Board of Review.
            <ul>
              <li>
                Option 1: Download your appeal letter and email it to the March
                Board of Review.
              </li>
              <li>
                Option 2: Complete this application and click &quot;Submit&quot;
                to automatically file your appeal with the March Board of
                Review.
              </li>
            </ul>
          </li>
          <li>
            <b>Step 3</b>: Attend your March Board of Review Hearing. You will
            receive an email and/or notice via mail with information about when
            your appeal is scheduled for a hearing.
          </li>
          <li>
            <b>Step 4</b>: Before June 2026, the Board of Review will send you a
            letter notifying you of the results of your appeal.
          </li>
        </ul>
        <p>
          <em>
            Call {DETROIT_PHONE} with any questions or{" "}
            <a target="_blank" rel="noopener noreferrer" href={HELP_LINK}>
              schedule an appointment
            </a>
            .
          </em>
        </p>
      </>
    )}
    {region === "cook" && (
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
          <strong>May 1, 2025</strong>. You can fill this out for yourself, have
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
          the Board of Assessors by its deadline, which is May 19, 2025.
        </li>
        <li>
          <b>Step 4</b>: On or around October 13, 2025, the Board of Assessors
          will send you a letter notifying you whether or not you won your
          appeal.
        </li>
      </ul>
    )}

    <h2>Who can use this application?</h2>

    {region == "detroit" && (
      <ol>
        <li>You own a home in the City of Detroit</li>
        <li>
          You occupy that home as your permanent residence (this tool is not for
          landlords!)
        </li>
      </ol>
    )}
    {region == "cook" && (
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
