import React, { useContext } from "react"
import { Button, Row, Col, Space, Divider } from "antd"
import PropertyInfo from "../../components/property-info"
import { cleanParcel, DISPLAY_FIELDS, DISPLAY_FIELDS_COOK } from "../../utils"
import PinChooser from "../../components/pin-chooser"
import { AppealContext, AppealDispatchContext } from "../../context/appeal"
import { useNavigate } from "react-router-dom"
import { getMinComparables, getMaxComparables } from "../../utils"

const ReviewComparables = () => {
  const appeal = useContext(AppealContext)
  const dispatch = useContext(AppealDispatchContext)
  const navigate = useNavigate()
  const minComparables = getMinComparables(appeal.city)
  const maxComparables = getMaxComparables(appeal.city)

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
        ...availablePins.slice(
          0,
          Math.max(0, minComparables - selectedPins.length)
        ),
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
        <Col xs={{ span: 24, offset: 0 }} md={{ span: 12, offset: 0 }}>
          <h2>
            Pick the 3-5 properties that are the most similar to your property.
          </h2>
          <p>
            These are called “comparable properties” and they are the most
            important part of our appeal. Please pick the 3 to 5 properties that
            are most similar to your own based on the information provided.
            While it is not required that comparable properties have any
            particular characteristics, we would strongly recommend that the
            properties you select have:
          </p>
          <ul>
            <li>A total square footage similar to your home</li>
            <li>A total number of bedrooms similar to your home</li>
            <li>A total number of bathrooms similar to your home</li>
            <li>
              An assessed value lower than your home. If you are having trouble
              finding comparable homes that have an assessed value lower than
              your home then it is possible that your home has NOT been
              overassessed.
            </li>
          </ul>
          <p>
            We strongly recommend that you select homes that are the most
            comparable in these categories rather than merely selecting multiple
            properties.
          </p>
          <p>
            If you are unsure about how best to select properties please{" "}
            <a href="#">make an appointment with a Community Advocate</a>.
          </p>
          <p>
            Below is a list of homes in your area that we have identified as
            possibly similar to your home. Pick the 5 that are most similar to
            your home. Select properties by clicking the “Add” button on the far
            right.
          </p>

          <h3>Potential comparable properties near you</h3>
          <p>
            This table includes properties which might be similar to yours.
            Click &apos;Add&apos; to add the property to your selected
            comparables.
          </p>
        </Col>
      </Row>
      <PinChooser
        headers={displayFields}
        propertyOptions={appeal.comparables.map(cleanParcel)}
        max={maxComparables}
        onChange={(pins) =>
          dispatch({ type: "select-comparables", pins: pins })
        }
      />

      <Divider />
      <Space>
        <Button
          size="large"
          type="danger"
          onClick={() => navigate("../review-property")}
        >
          Back
        </Button>
        {/* TODO: consolidate? doing the same thing */}
        <Button
          size="large"
          type="primary"
          disabled={appeal.selectedComparables.length === 0}
          onClick={advancePage}
        >
          Next Page
        </Button>
        <Button size="large" type="primary" onClick={advancePage}>
          Skip this step
        </Button>
      </Space>
      <Divider />
      <p>Page 4 of 5</p>
    </>
  )
}

export default ReviewComparables
