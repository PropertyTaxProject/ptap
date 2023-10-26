import React from "react"
import PropTypes from "prop-types"
import { Row, Col, Card } from "antd"
import { cleanParcel, DISPLAY_FIELDS, DISPLAY_FIELDS_COOK } from "../../utils"

// displays the target property information
const PropertyInfo = (props) => {
  const { city, targetProperty, cols } = props
  const gridStyle = {
    width: `${Math.round(100 / cols)}%`,
    textAlign: "center",
  }
  const parcel = cleanParcel(targetProperty)
  const baseFields = city === "cook" ? DISPLAY_FIELDS_COOK : DISPLAY_FIELDS
  const fields = baseFields.filter(({ title }) => title !== "Distance")
  return (
    <>
      <Row>
        <Col xs={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
          <h1>Your Property Information</h1>
          <p>
            Below is the data that the Assessor has on file for your property.
          </p>
          <br />
        </Col>
      </Row>
      {fields.map(({ title, field }) => (
        <Card.Grid key={field} hoverable={false} style={gridStyle}>
          <Row>
            <b>{title}</b>
          </Row>
          <Row>
            <p>{parcel[field]}</p>
          </Row>
        </Card.Grid>
      ))}
    </>
  )
}

PropertyInfo.propTypes = {
  city: PropTypes.string,
  targetProperty: PropTypes.string,
  cols: PropTypes.array,
}

export default PropertyInfo
