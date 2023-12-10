import React, { useContext } from "react"
import { Button, Row, Col, Space, Divider } from "antd"
import PropertyInfo from "../../components/property-info"
import { cleanParcel, DISPLAY_FIELDS, DISPLAY_FIELDS_COOK } from "../../utils"
import PinChooser from "../../components/pin-chooser"
import { AppealContext, AppealDispatchContext } from "../../context/appeal"
import { useNavigate } from "react-router-dom"
import { getNumberComparables } from "../../utils"

const ReviewComparables = () => {
  const appeal = useContext(AppealContext)
  const dispatch = useContext(AppealDispatchContext)
  const navigate = useNavigate()
  const numComparables = getNumberComparables(appeal.city)

  const advancePage = () => {
    // add up to exactly five on advance, update on submit
    const selectedPins = appeal.selectedComparables.map(({ pin }) => pin)
    const availablePins = appeal.comparables
      .map(({ pin }) => pin)
      .filter((pin) => !selectedPins.includes(pin))
    dispatch({
      type: "select-comparables",
      pins: [
        ...selectedPins,
        ...availablePins.slice(0, numComparables - selectedPins.length),
      ],
    })
    navigate("../review-appeal")
  }

  const displayFields = ["cook", "chicago"].includes(appeal.city)
    ? DISPLAY_FIELDS_COOK
    : DISPLAY_FIELDS

  return (
    <>
      <h1>Your Property Information</h1>
      <p>Below is the data that the Assessor has on file for your property.</p>
      <PropertyInfo city={appeal.city} target={appeal.target} cols={5} />
      <Divider />
      <Row>
        <Col xs={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
          <h1>
            Pick the 5 properties that are the most similar to your property.
          </h1>
          <p>
            It is okay if you are unsure, your advocate will talk with you about
            this in more detail.
          </p>
          <p>
            Below is a list of homes in your area that we have identified as
            possibly similar to your home. Pick the 5 that are most similar to
            your home. Select properties by clicking the “Add” button on the far
            right.
          </p>
        </Col>
      </Row>
      <>
        <h3>Properties Recently Sold Near You</h3>
        <p>
          This table includes properties which might be similar to yours. Click
          &apos;Add&apos; to add the property to your selected comparables.
        </p>
        <PinChooser
          headers={displayFields}
          propertyOptions={appeal.comparables.map(cleanParcel)}
          max={5}
          onChange={(pins) =>
            dispatch({ type: "select-comparables", pins: pins })
          }
        />
        <Space>
          <Button type="danger" onClick={() => navigate("../review-property")}>
            Back
          </Button>
          {/* TODO: consolidate? doing the same thing */}
          <Button
            type="primary"
            disabled={appeal.selectedComparables.length === 0}
            onClick={advancePage}
          >
            Next Page
          </Button>
          <Button type="primary" onClick={advancePage}>
            Skip this step
          </Button>
        </Space>
      </>
      <br></br>
      <p>Page 4 of 5</p>
    </>
  )
}

export default ReviewComparables
