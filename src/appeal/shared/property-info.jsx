import React from "react"
import PropTypes from "prop-types"
import { Row, Col, Card } from "antd"

const re = /(\b[a-z](?!\s))/g
const createTitle = (title) =>
  title.replace("_", " ").replace(re, (x) => x.toUpperCase())

// displays the target property information
const PropertyInfo = (props) => {
  const { targetProperty, cols } = props
  const gridStyle = {
    width: `${Math.round(100 / cols)}%`,
    textAlign: "center",
  }
  const characteristics = Object.entries(targetProperty).filter(
    ([title, description]) =>
      title !== "" &&
      description !== "" &&
      title !== "pin" &&
      title !== "Distance"
  )
  characteristics.sort(([title1], [title2]) => {
    const t1 = title1.toLowerCase()
    const t2 = title2.toLowerCase()
    if (t1 > t2) {
      return 1
    }
    if (t1 < t2) {
      return -1
    }
    return 0
  })
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
      {characteristics.map(([title, description]) => (
        <Card.Grid key={title} hoverable={false} style={gridStyle}>
          <Row>
            <b>{createTitle(title)}</b>
          </Row>
          <Row>
            <p>{description}</p>
          </Row>
        </Card.Grid>
      ))}
    </>
  )
}

PropertyInfo.propTypes = {
  targetProperty: PropTypes.string,
  cols: PropTypes.array,
}

export default PropertyInfo
