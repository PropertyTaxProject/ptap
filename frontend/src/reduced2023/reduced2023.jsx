import React, { useState } from "react"
import PropTypes from "prop-types"
import Page2023 from "./pages/page2023"

const Reduced2023 = (props) => {
  const { city } = props
  const [, setPin] = useState(null)
  const [, setUuid] = useState([])

  let view = (
    <Page2023
      logPin={(selectedPin) => {
        setPin(selectedPin)
      }}
      city={city}
      logUuid={(givenUuid) => {
        setUuid(givenUuid)
      }}
    />
  )

  return view
}

Reduced2023.propTypes = {
  city: PropTypes.string,
}

export default Reduced2023
