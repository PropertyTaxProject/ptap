import React, { useState } from "react"
import PropTypes from "prop-types"
import { Button, Table, Row, Col, Space, Divider } from "antd"
import PropertyInfo from "../shared/property-info"
import { cleanParcel, DISPLAY_FIELDS, DISPLAY_FIELDS_COOK } from "../../utils"

const Characteristics = (props) => {
  const {
    city,
    comparablesPool,
    targetProperty,
    propInfo,
    logComparables,
    back,
  } = props

  const [selectedComparables, setSelected] = useState([])
  const showSelected = selectedComparables.length > 0
  const selectedPins = selectedComparables.map(({ pin }) => pin)
  const candidates = comparablesPool
    .filter(({ pin }) => !selectedPins.includes(pin))
    .map(cleanParcel)

  const advancePage = () => {
    // TODO: Should remove likely
    //add up to exactly five on advance, update on submit
    while (selectedComparables.length < 5) {
      selectedComparables.push(comparablesPool.shift())
    }
    logComparables(selectedComparables)
  }

  const baseFields = ["cook", "chicago"].includes(city)
    ? DISPLAY_FIELDS_COOK
    : DISPLAY_FIELDS
  const comparableColumns = baseFields.map(({ title, field }) => (
    <Table.Column title={title} dataIndex={field} key={field} />
  ))

  return (
    <>
      <PropertyInfo
        city={city}
        targetProperty={targetProperty}
        cols={5}
        propInfo={propInfo}
      />
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
        {showSelected && (
          <>
            <h3>Your Selected Comparables</h3>
            <p>
              This table includes properties you have selected as comparables to
              yours. Click &apos;Delete&apos; to remove the property from your
              selection.
            </p>
          </>
        )}
        <Table
          dataSource={selectedComparables}
          scroll={{ x: true }}
          style={showSelected ? { display: "" } : { display: "none" }}
        >
          {comparableColumns}
          <Table.Column
            title="Action"
            key="action"
            render={(record) => (
              <Button
                danger
                onClick={() => {
                  setSelected(
                    selectedComparables.filter(
                      (candidate) => candidate.pin !== record.pin
                    )
                  )
                }}
              >
                Delete
              </Button>
            )}
          />
        </Table>
        <h3>Properties Recently Sold Near You</h3>
        <p>
          This table includes properties which might be similar to yours. Click
          &apos;Add&apos; to add the property to your selected comparables.
        </p>
        <Table dataSource={candidates} scroll={{ x: true }}>
          {comparableColumns}
          <Table.Column
            title="Action"
            key="action"
            render={(record) => (
              <Button
                primary
                onClick={() => {
                  if (selectedComparables.length >= 5) {
                    alert(
                      "You may only add up to 5 comparables. In order to continue adding this property, you must remove one you have already added."
                    )
                  } else {
                    setSelected(selectedComparables.concat(record))
                  }
                }}
              >
                Add
              </Button>
            )}
          />
        </Table>
        <Space>
          <Button type="danger" onClick={back}>
            Back
          </Button>
          {showSelected && (
            <Button type="primary" onClick={advancePage}>
              Next Page
            </Button>
          )}
          {showSelected === false && (
            <Button type="primary" onClick={advancePage}>
              Skip this step
            </Button>
          )}
        </Space>
      </>
      <br></br>
      <p>Page 4 of 5</p>
    </>
  )
}

Characteristics.propTypes = {
  city: PropTypes.string,
  comparablesPool: PropTypes.array,
  headers: PropTypes.array,
  targetProperty: PropTypes.object,
  propInfo: PropTypes.object,
  logComparables: PropTypes.array,
  back: PropTypes.func,
}

export default Characteristics
