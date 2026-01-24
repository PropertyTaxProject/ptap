import React, { useContext } from "react"
import { Button, Row, Col, Space, Divider } from "antd"
import PropertyInfo from "../../components/property-info"
import { getDisplayFields, getPageLabel } from "../../utils"
import PinChooser from "../../components/pin-chooser"
import { AppealContext, AppealDispatchContext } from "../../context/appeal"
import { useNavigate } from "react-router-dom"
import { getMinComparables, getMaxComparables, HELP_LINK } from "../../utils"

const ReviewComparables = () => {
  const appeal = useContext(AppealContext)
  const dispatch = useContext(AppealDispatchContext)
  const navigate = useNavigate()
  const minComparables = getMinComparables(appeal.region)
  const maxComparables = getMaxComparables(appeal.region)

  const advancePage = () => {
    // If someone doesn't select comparables, add up to the minimum
    // number from the ordered list of available comparables
    const selectedPins = appeal.selected_comparables.map(({ pin }) => pin)
    const availablePins = appeal.comparables
      .map(({ pin }) => pin)
      .filter((pin) => !selectedPins.includes(pin))
    const selectedComparables = [
      ...selectedPins,
      ...availablePins.slice(
        0,
        Math.max(0, minComparables - selectedPins.length)
      ),
    ]
    // Hacky workaround to handling primary
    if (selectedComparables.length === 1) {
      dispatch({
        type: "select-primary-comparable",
        pin: selectedComparables[0],
      })
    } else {
      dispatch({
        type: "select-comparables",
        pins: selectedComparables,
      })
    }

    navigate("../damage")
  }

  const displayFields = getDisplayFields(appeal.region)

  return (
    <>
      <Row>
        <Col xs={{ span: 24, offset: 0 }} md={{ span: 16, offset: 0 }}>
          <h1>Pick the property that is most similar to your home</h1>
          <p>
            This application looks at the sales of similar homes in your area to
            help you estimate the value of your home.
          </p>
          <p>
            If you are unsure about how best to select properties please{" "}
            <a target="_blank" rel="noopener noreferrer" href={HELP_LINK}>
              make an appointment with a Community Advocate
            </a>
            .
          </p>

          <h2>Your property</h2>
        </Col>
      </Row>
      <PropertyInfo region={appeal.region} target={appeal.target} cols={5} />
      <Row>
        <Col xs={{ span: 24, offset: 0 }} md={{ span: 16, offset: 0 }}>
          <h2>Potential comparable properties near you</h2>
          <p>
            Below is a list of homes in your area that we have identified as
            possibly similar to your home. Select the property that you believe
            is most similar to your home.
          </p>
        </Col>
      </Row>
      <PinChooser
        headers={displayFields}
        propertyOptions={appeal.comparables}
        max={maxComparables}
        isSelectLabels
        pins={appeal.selected_comparables.map(({ pin }) => pin)}
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
        <Button size="large" type="primary" onClick={advancePage}>
          Next Page
        </Button>
      </Space>
      <Divider />
      <p>{getPageLabel("review-comparables", appeal)}</p>
    </>
  )
}

export default ReviewComparables
