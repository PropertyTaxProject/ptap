import React from "react"
import { Space } from "antd"
import PropTypes from "prop-types"
import coalition from "../../assets/coalition_logo.png"
import udmLaw from "../../assets/udmlaw.png"
import ilo from "../../assets/ilo.png"
import communityAdvocates from "../../assets/community-advocates.jpg"
import uwLaw from "../../assets/uw-law.png"

const AppealClosed = ({ region }) => (
  <>
    <h1>Who We Are</h1>
    {region === "detroit" ? (
      <>
        <p>
          The Institute for Law and Organizing and the Coalition for Property
          Tax Justice are nonprofit community organizations, which have
          partnered with the University of Detroit Mercy School of Law Housing
          Law Clinic to create the Detroit Property Tax Appeal Program. This
          program helps Detroit homeowners determine whether or not the City of
          Detroit has illegally inflated their property taxes. If so, we partner
          with homeowners to file a property tax assessment appeal to correct
          this, FREE OF CHARGE.
        </p>
        <Space wrap direction="horizontal">
          <img
            src={ilo}
            style={{ height: "80px" }}
            alt="Institute for Law and Organizing logo"
          />
          <img
            src={udmLaw}
            style={{ height: "80px" }}
            alt="University of Detroit Mercy Law logo"
          />
          <img
            src={coalition}
            style={{ height: "80px" }}
            alt="Coalition for Property Tax Justice logo"
          />
        </Space>
        <br />
        <br />
        <p>
          Our 2025 application period for the 2025 Property Tax Appeals Program
          has closed. If you believe your home is over assessed, you can still
          appeal your property tax assessment to the Board of Review by
          submitting an application using{" "}
          <a href="https://detroitmi.gov/government/boards/property-assessment-board-review">
            these instructions
          </a>{" "}
          by March 10.
        </p>
      </>
    ) : (
      ``
    )}
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
        <Space wrap direction="horizontal">
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
        </Space>
        <br />
        <br />
        <p>
          Our 2025 application period for the 2025 Property Tax Appeals Program
          has closed.
        </p>
      </>
    ) : (
      ``
    )}
  </>
)

AppealClosed.propTypes = {
  region: PropTypes.string,
}

export default AppealClosed
