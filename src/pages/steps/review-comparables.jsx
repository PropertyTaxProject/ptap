import React from "react"
import PropTypes from "prop-types"
import { Button, Row, Col, Space, Divider } from "antd"
import PropertyInfo from "../../components/property-info"
import { cleanParcel, DISPLAY_FIELDS, DISPLAY_FIELDS_COOK } from "../../utils"
import PinChooser from "../../components/pin-chooser"

const ReviewComparables = ({
  city,
  comparables,
  selectedComparables,
  target,
  numComparables,
  onChange,
  onNext,
  back,
}) => {
  const advancePage = () => {
    console.log("ran")
    // add up to exactly five on advance, update on submit
    const selectedPins = selectedComparables.map(({ pin }) => pin)
    const availablePins = comparables
      .map(({ pin }) => pin)
      .filter((pin) => !selectedPins.includes(pin))
    console.log(availablePins)
    console.log(numComparables - selectedPins.length)
    console.log([
      ...availablePins.slice(0, numComparables - selectedPins.length),
    ])
    // onChange([...selectedPins, ...availablePins.slice(0, (numComparables - selectedPins.length))])
    onNext([
      ...selectedPins,
      ...availablePins.slice(0, numComparables - selectedPins.length),
    ]) // TODO: Hacky
  }

  const displayFields = ["cook", "chicago"].includes(city)
    ? DISPLAY_FIELDS_COOK
    : DISPLAY_FIELDS

  return (
    <>
      <h1>Your Property Information</h1>
      <p>Below is the data that the Assessor has on file for your property.</p>
      <PropertyInfo city={city} target={target} cols={5} />
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
          propertyOptions={comparables.map(cleanParcel)}
          max={5}
          onChange={onChange}
        />
        <Space>
          <Button type="danger" onClick={back}>
            Back
          </Button>
          <Button
            type="primary"
            disabled={selectedComparables.length === 0}
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

ReviewComparables.propTypes = {
  city: PropTypes.string,
  comparables: PropTypes.array,
  selectedComparables: PropTypes.array,
  headers: PropTypes.array,
  target: PropTypes.object,
  numComparables: PropTypes.number,
  onChange: PropTypes.func,
  onNext: PropTypes.func,
  back: PropTypes.func,
}

export default ReviewComparables
