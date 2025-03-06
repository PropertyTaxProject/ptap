import React from "react"
import { Space } from "antd"
import PropTypes from "prop-types"
import coalition from "../../assets/coalition_logo.png"
import udmLaw from "../../assets/udmlaw.png"
import ilo from "../../assets/ilo.png"

const AppealClosed = ({ region }) => (
  <>
    <h1>Who We Are</h1>
    <p>
      The Institute for Law and Organizing and the Coalition for Property Tax
      Justice are nonprofit community organizations, which have partnered with
      the University of Detroit Mercy School of Law Housing Law Clinic to create
      the Detroit Property Tax Appeal Program. This program helps Detroit
      homeowners determine whether or not the City of Detroit has illegally
      inflated their property taxes. If so, we partner with homeowners to file a
      property tax assessment appeal to correct this, FREE OF CHARGE.
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
    {region === "detroit" && (
      <p>
        Our 2025 application period for the 2025 Property Tax Appeals Program
        has closed. If you believe your home is over assessed, you can still
        appeal your property tax assessment to the Board of Review by submitting
        an application using{" "}
        <a href="https://detroitmi.gov/government/boards/property-assessment-board-review">
          these instructions
        </a>{" "}
        by March 10.
      </p>
    )}
  </>
)

AppealClosed.propTypes = {
  region: PropTypes.string,
}

export default AppealClosed
