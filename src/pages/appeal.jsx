import React, { useState } from "react"
import PropTypes from "prop-types"
import { submitAppeal, submitForm } from "../requests"
import HomeownerInfo from "./steps/homeowner-info"
import ReviewProperty from "./steps/review-property"
import ReviewComparables from "./steps/review-comparables"
import ReviewAppeal from "./steps/review-appeal"
import AppealLookup from "./steps/appeal-lookup"

const Appeal = (props) => {
  const { city } = props
  const [state, setState] = useState({
    pin: null,
    uuid: null,
    eligible: null,
    target: null,
    propertyInfo: null,
    estimate: {},
    step: 1,
    selected: false,
    headers: [],
    comparables: [],
    selectedComparables: [],
    propertyOptions: null,
    user: null,
    userProperty: null,
    files: [],
  })

  /*
  Appeal has a series of pages viewed in seq order
  
  1) Eligibility Requirements (Default): Find pin and sets uuid
  2) Contact Info: Collects Contact Info
  3) Review Property: Review Selected Property Information
  4) Comparables: Select Comparables
  5) Review Appeal: Review Appeal

  */

  let view = (
    <AppealLookup
      city={city}
      pin={state.pin}
      target={state.target}
      propertyOptions={state.propertyOptions}
      setPropertyOptions={(propertyOptions) =>
        setState({ ...state, propertyOptions })
      }
      setPin={(pin) =>
        setState({
          ...state,
          pin,
          target: state.propertyOptions.find((o) => pin === o.pin),
        })
      }
      setEligibility={(eligible) => setState({ ...state, eligible })}
    />
  )

  if (state.eligible === true) {
    view = (
      <HomeownerInfo
        city={city}
        pin={state.pin}
        uuid={state.uuid}
        eligibility={state.eligible}
        submitForm={async (info) => {
          const response = await submitForm(info)
          if (response != null) {
            setState({
              ...state,
              user: info,
              comparables: response.comparables,
              headers: response.labeled_headers,
              target: response.target_pin[0],
              propertyInfo: response.prop_info,
            })
          }
        }}
        back={() => {
          setState({
            ...state,
            user: null,
            pin: null,
            comparables: [],
            headers: [],
            target: null,
            propertyInfo: [],
            eligibility: null,
          })
        }}
      />
    )
  }

  if (state.user !== null) {
    view = (
      <ReviewProperty
        city={city}
        target={state.target}
        submitPropReview={async (userProperty) => {
          setState({ ...state, userProperty })
        }}
        back={() => {
          setState({
            ...state,
            user: null,
            comparables: [],
            headers: [],
            target: null,
          })
        }}
      />
    )
  }

  if (state.userProperty !== null) {
    view = (
      <ReviewComparables
        city={city}
        comparables={state.comparables}
        selectedComparables={state.selectedComparables}
        headers={state.headers}
        target={state.target}
        numComparables={5}
        onChange={(pins) => {
          console.log(pins)
          setState({
            ...state,
            selectedComparables: state.comparables.filter(({ pin }) =>
              pins.includes(pin)
            ),
          })
        }}
        onNext={(pins) => {
          setState({
            ...state,
            selectedComparables: state.comparables.filter(({ pin }) =>
              pins.includes(pin)
            ),
            step: 6,
          })
        }}
        back={() =>
          setState({
            ...state,
            user: null,
            comparables: [],
            selectedComparables: [],
            headers: [],
          })
        }
      />
    )
  }

  if (state.selectedComparables.length === 5 && state.step === 6) {
    view = (
      <ReviewAppeal
        city={city}
        target={state.target}
        userInfo={state.user}
        comparables={state.selectedComparables}
        files={state.files}
        onChangeFiles={state.setFiles}
        confirmInfo={() => {
          submitAppeal(
            state.target,
            state.selectedComparables,
            state.user,
            state.userProperty,
            state.uuid,
            state.files
          )
        }}
        back={() => {
          // TODO:
          setState({ ...state, step: 1 })
        }}
      />
    )
  }

  // TODO: Still have redirect?
  // if (reportedEligibility != null && reportedEligibility === false) {
  //   history.push("/illegalforeclosures")
  // }

  return view
}

Appeal.propTypes = {
  city: PropTypes.string,
}

export default Appeal
