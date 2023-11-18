import React from "react"
import PropTypes from "prop-types"

const PtapLanguage = ({ estimate }) => (
  <>
    <h1>Is the City of Detroit Overtaxing You?</h1>
    <p>
      The Michigan Constitution requires that the City of Detroit assess each
      property at no more than 50 percent of its market value, meaning what it
      could sell for.{" "}
      <a
        href="http://www.legislature.mi.gov/(S(kioev32ipygkaee2kepvbbtn))/mileg.aspx?page=getobject&objectname=mcl-Article-IX-3"
        target="_blank"
        rel="noopener noreferrer"
      >
        Click here
      </a>{" "}
      to read Article IX § 3 of the Michigan Constitution.
    </p>
    <strong>{estimate}</strong>
    <br></br>
    <br></br>
    <p>
      *Note: Other factors impact your tax bill, including exemptions and caps
      on your property’s taxable value. As such, our estimate might not be
      accurate.
    </p>
    <h3>File Your Tax Assessment Appeal!</h3>
    <p>
      To file on your own, submit your appeal by emailing it to{" "}
      <b>AssessorReview@detroitmi.gov</b> no later than February 22, 2023 (make
      sure to attach the evidence you downloaded from this tool!). To get
      assistance filing your appeal,{" "}
      <a href="https://actionnetwork.org/forms/property-tax-assessment-appeal-interest-form?source=app">
        {" "}
        complete our interest form
      </a>{" "}
      to sign up for FREE assistance appealing your property taxes no later than
      February 15, 2023.
    </p>
  </>
)

PtapLanguage.propTypes = {
  estimate: PropTypes.any,
}

export default PtapLanguage
