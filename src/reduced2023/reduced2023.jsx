import React, { useState } from "react"
import { Button, Divider, Table } from "antd"
import { submitForm, submitEstimate, submitEstimate2 } from "../requests"
import PinLookup from "../components/pin-lookup"
import ToolIntro from "./content/tool-intro"
import PinChooser from "../components/pin-chooser"
import { DISPLAY_FIELDS, cleanParcel } from "../utils"
import { FileUpload } from "../components/file-upload"
import PtapLanguage from "./content/ptap-language"

const appealType = "detroit_single_family"

const Reduced2023 = () => {
  const [state, setState] = useState({
    pin: null,
    uuid: null,
    target: {},
    propertyInfo: null,
    estimate: {},
    step: 1,
    selected: false,
    headers: [],
    comparables: [],
    selectedComparables: [],
    propertyOptions: null,
    files: [],
  })

  const targetColumns = DISPLAY_FIELDS.filter(
    ({ title }) => title !== "Distance"
  ).map(({ title, field }) => (
    <Table.Column title={title} dataIndex={field} key={field} />
  ))

  const onSubmit = async () => {
    const [, res] = await Promise.all([
      submitEstimate(
        state.target,
        "", // TODO: is UUID
        state.comparables,
        state.selectedComparables,
        state.files
      ),
      submitEstimate2(
        state.target,
        "",
        state.comparables,
        state.selectedComparables
      ),
    ])

    if (res != null) {
      setState({ ...state, estimate: res.estimate, step: 6 })
    }
  }

  return (
    <>
      <h1>Welcome to the Search and Compare Tool!</h1>
      <ToolIntro />
      <Divider />
      {state.step >= 1 && (
        <>
          <h2>Step 1</h2>
          <p>Enter your address into the search bar.</p>
          <PinLookup
            appealType={appealType}
            onSearch={(propertyOptions) =>
              setState({ ...state, propertyOptions })
            }
          />
        </>
      )}
      {state.propertyOptions && state.propertyOptions.length === 0 && (
        <p>
          Your property could not be found. Please try searching again. NOTE:
          Homes which are NEZs cannot be processed by this tool.
        </p>
      )}
      {state.propertyOptions && state.propertyOptions.length > 0 && (
        <>
          <h2>Step 2</h2>
          <p>
            Select your property from the table and then click “Get Sales Data.”
          </p>
          <p>
            After searching for your home, please hit <b>Select</b> next to your
            property
          </p>
          <PinChooser
            headers={[
              {
                title: "Address",
                field: "address",
              },
              {
                title: "PIN",
                field: "pin",
              },
            ]}
            propertyOptions={state.propertyOptions}
            max={1}
            isSelectLabels
            onChange={(selectedProperties) =>
              setState({
                ...state,
                pin:
                  selectedProperties.length === 0
                    ? null
                    : selectedProperties[0],
              })
            }
          />
          <Button
            type="primary"
            disabled={state.pin === null}
            onClick={async () => {
              const res = await submitForm({
                appeal_type: appealType,
                pin: state.pin,
              })
              if (res === null) return
              setState({
                ...state,
                comparables: res.comparables,
                headers: res.labeled_headers,
                target: res.target_pin[0],
                propertyInfo: res.prop_info,
                step: 3,
              })
            }}
          >
            Get Sales Data
          </Button>
          <Divider />
        </>
      )}
      {state.step >= 3 && state.comparables.length > 0 && (
        <>
          <h2>Step 3</h2>
          <p>
            Compare the City’s estimate of your property’s MARKET VALUE to the
            SALES PRICES of homes that have recently sold in your neighborhood.
            If the market value of your property is HIGHER than the sales prices
            of similar homes, the City is over assessing your property value.
          </p>
          <p>
            Below is the data that the Assessor has on file for your property.
          </p>
          <Table dataSource={[cleanParcel(state.target)]} scroll={{ x: true }}>
            {targetColumns}
          </Table>
          {state.propertyInfo}
          <Divider />
          <h2>Step 4</h2>
          <p>
            Select the sale in your neighborhood that is most similar to your
            property. If you aren’t sure, pick the home that is closest to
            yours. Click the “Generate Appeal Evidence” button to receive the
            property sales data that you can attach as evidence to your property
            tax assessment appeal.
          </p>
          <p>
            <i>
              Tip: Make sure the property you select is not in much worse
              condition than your home. If you can, walk or drive by the
              property to check it out.
            </i>
          </p>
          <PinChooser
            headers={DISPLAY_FIELDS}
            propertyOptions={state.comparables.map(cleanParcel)}
            onChange={(pins) =>
              setState({
                ...state,
                selectedComparables: state.comparables.filter(({ pin }) =>
                  pins.includes(pin)
                ),
              })
            }
          />
          <h2>Step 5</h2>
          <p>
            Upload any images of damage to your property that would impact your
            assessed value.
          </p>
          <FileUpload
            accept="image/*,.heic,.heif"
            files={state.files}
            onChange={(files) => setState({ ...state, files })}
          />
          <Divider />
          <Button type="primary" onClick={onSubmit}>
            Generate Appeal Evidence
          </Button>
        </>
      )}
      {state.step >= 6 && (
        <>
          <Divider />
          <PtapLanguage estimate={state.estimate} />
        </>
      )}
    </>
  )
}

export default Reduced2023
