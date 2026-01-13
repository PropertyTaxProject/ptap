import React from "react"
import { Space } from "antd"
import PropTypes from "prop-types"
import coalition from "../../assets/coalition_logo.png"
import ilo from "../../assets/ilo.png"
import communityAdvocates from "../../assets/community-advocates.jpg"
import uwLaw from "../../assets/uw-law.png"
import { DETROIT_PHONE } from "../../utils"

const AppealClosed = ({ region }) => (
  <>
    <h1>Who We Are</h1>
    {region === "detroit" ? (
      <>
        <p>
          The Detroit Property Tax Appeal Project helps Detroit homeowners
          determine whether the City of Detroit has illegally inflated their
          property taxes. You can use this application to help you create and
          file your own property tax assessment appeal.
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
