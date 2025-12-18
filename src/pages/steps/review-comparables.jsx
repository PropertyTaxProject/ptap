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
    // add up to exactly five on advance, update on submit
    const selectedPins = appeal.selected_comparables.map(({ pin }) => pin)
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
    navigate("../damage")
  }

  const displayFields = getDisplayFields(appeal.region)

  return (
    <>
      <Row>
        <Col xs={{ span: 24, offset: 0 }} md={{ span: 16, offset: 0 }}>
          <h1>
            Pick the 3-5 properties that are the most similar to your property.
          </h1>
          <p>
            These are called “comparable properties” and they are the most
            important part of our appeal. Please pick the 3 to 5 properties that
            are most similar to your own based on the information provided. We
            would strongly recommend that the properties you select have:
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
            possibly similar to your home. Select properties by clicking the
            &apos;Add&apos; on the far right.
          </p>
        </Col>
      </Row>
      <PinChooser
        headers={displayFields}
        propertyOptions={appeal.comparables}
        max={maxComparables}
        pins={appeal.selected_comparables.map(({ pin }) => pin)}
        onChange={(pins) =>
          dispatch({ type: "select-comparables", pins: pins })
        }
        includePrimary
        primary={appeal.selected_primary}
        onChangePrimary={(pin) =>
          dispatch({ type: "select-primary-comparable", pin })
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
        <Button
          size="large"
          type="primary"
          disabled={appeal.selected_comparables.length < minComparables}
          onClick={advancePage}
        >
          Next Page
        </Button>
      </Space>
      <Divider />
      <p>{getPageLabel("review-comparables", appeal)}</p>
    </>
  )
}

export default ReviewComparables
