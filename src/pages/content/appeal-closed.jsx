import React from "react"
import { Space } from "antd"
import PropTypes from "prop-types"
import coalition from "../../assets/coalition_logo.png"
import ilo from "../../assets/ilo.png"

const AppealClosed = ({ region }) => (
  <>
    <h1>Who We Are</h1>
    <p>
      The Coalition for Property Tax Justice is the current campaign of the
      Institute for Law and Organizing (ILO). We are a nonprofit community
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
    {region === "detroit" && (
      <p>
        Our 2024 application period for the 2024 Property Tax Appeals Program
        has closed. If you believe your home is over assessed, you can still
        appeal your property tax assessment to the Board of Review by submitting
        an application using{" "}
        <a href="https://detroitmi.gov/government/boards/property-assessment-board-review">
          these instructions
        </a>{" "}
        by March 11.
      </p>
    )}
  </>
)

AppealClosed.propTypes = {
  region: PropTypes.string,
}

export default AppealClosed
