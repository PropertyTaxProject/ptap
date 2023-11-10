import React, { useState } from "react"
import PropTypes from "prop-types"
import PinChooser from "../../components/pin-chooser"
import PinLookup from "../../components/pin-lookup"

const PIN_HEADERS = [
  {
    title: "Address",
    field: "address",
  },
  {
    title: "PIN",
    field: "pin",
  },
]

const PinLookupPage = ({ appealType, onSelect }) => {
  const [propertyOptions, setPropertyOptions] = useState(null)

  return (
    <>
      <h1>Step 1</h1>
      <p>Enter your address into the search bar.</p>
      <PinLookup
        appealType={appealType}
        onSearch={(opts) => setPropertyOptions(opts)}
      />
      {propertyOptions?.length > 0 && (
        <>
          <h1>Step 2</h1>
          <p>
            Select your property from the table and then click “Get Sales Data.”
          </p>
          <p>
            After searching for your home, please hit <b>Select</b> next to
            your property
          </p>
          <PinChooser
            headers={PIN_HEADERS}
            propertyOptions={propertyOptions}
            max={1}
            isSelectLabels
            onChange={(selectedProperties) =>
              onSelect(selectedProperties.length === 0 ? null : selectedProperties[0])
            }
          />
        </>
      )}
      {propertyOptions && propertyOptions.length === 0 && (
        <p>Your property could not be found. Please try searching again. NOTE: Homes which are NEZs cannot be processed by this tool.</p>
      )}
    </>
  )
}

PinLookupPage.propTypes = {
  appealType: PropTypes.string,
  onSelect: PropTypes.func,
}

export default PinLookupPage
