import React, { useState } from "react"
import PropTypes from "prop-types"
import { submitEstimate, submitEstimate2 } from "../../requests"
import { Form, Button, Table, Divider } from "antd"

const { Column } = Table
const re = /(\b[a-z](?!\s))/g
const createTitle = (title) =>
  title.replace("_", " ").replace(re, (x) => x.toUpperCase())

//show comparables
const ComparablesTable = (props) => {
  const {
    comparablesPool,
    headers,
    propInfo,
    targetProperty,
    Uuid,
    setStep,
    setEstimate,
  } = props

  const [candidates, setCandidates] = useState([])
  const [selectedComparables, setSelected] = useState([])
  const [form] = Form.useForm()

  if (
    (candidates === undefined || candidates.length === 0) &&
    selectedComparables.length === 0
  ) {
    setCandidates(comparablesPool) //initialize comparables pool
  }

  const showSelected = selectedComparables.length > 0

  const excludeColumns = [
    "pin",
    "total_sqft",
    "total_acre",
    "Total Floor Area",
    "score",
  ]

  let Columns = []
  for (const header of headers) {
    if (excludeColumns.includes(header) === false) {
      Columns.push(
        <Column title={createTitle(header)} dataIndex={header} key={header} />
      )
    }
  }
  Columns = Columns.sort()

  return (
    <>
      <h2>
        Step 3. Compare the City’s estimate of your property’s MARKET VALUE to
        the SALES PRICES of homes that have recently sold in your neighborhood.
        If the market value of your property is HIGHER than the sales prices of
        similar homes, the City is over assessing your property value.
      </h2>
      <p>Below is the data that the Assessor has on file for your property.</p>
      <Table dataSource={[targetProperty]} scroll={{ x: true }}>
        {Columns}
      </Table>
      {propInfo}
      <Divider />
      <h2>
        Step 4. Select the sale in your neighborhood that is most similar to
        your property. If you aren’t sure, pick the home that is closest to
        yours. Click the “Generate Appeal Evidence” button to receive the
        property sales data that you can attach as evidence to your property tax
        assessment appeal.
      </h2>

      <p>
        {" "}
        <i>
          Tip: Make sure the property you select is not in much worse condition
          than your home. If you can, walk or drive by the property to check it
          out.{" "}
        </i>
      </p>
      <Table dataSource={candidates} scroll={{ x: true }}>
        {Columns}
        <Column
          title="Action"
          key="action"
          render={(record) => {
            const isSelected = !!selectedComparables.find(
              ({ pin }) => record.pin === pin
            )
            return (
              <Button
                danger={isSelected}
                onClick={() =>
                  setSelected(
                    isSelected
                      ? selectedComparables.filter(
                          ({ pin }) => record.pin !== pin
                        )
                      : selectedComparables.concat(record)
                  )
                }
              >
                {isSelected ? "Delete" : "Add"}
              </Button>
            )
          }}
        />
      </Table>
      {showSelected && (
        <Form
          form={form}
          name="Get Comps Final"
          layout="vertical"
          onFinish={async () => {
            await submitEstimate(
              targetProperty,
              Uuid,
              comparablesPool,
              selectedComparables
            )
            setStep(3)
            const resp2 = await submitEstimate2(
              targetProperty,
              Uuid,
              comparablesPool,
              selectedComparables
            )
            if (resp2 != null) {
              setEstimate(resp2.estimate)
            }
          }}
          labelAlign="left"
          scrollToFirstError
          autoComplete="off"
        >
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Generate Appeal Evidence
            </Button>
          </Form.Item>
        </Form>
      )}
    </>
  )
}

ComparablesTable.propTypes = {
  comparablesPool: PropTypes.array,
  headers: PropTypes.array,
  propInfo: PropTypes.object,
  targetProperty: PropTypes.string,
  Uuid: PropTypes.string,
  setStep: PropTypes.func,
  setEstimate: PropTypes.func,
}

const Comparables = (props) => {
  const {
    comparablesPool,
    headers,
    targetProperty,
    propInfo,
    Uuid,
    setStep,
    setEstimate,
  } = props

  return (
    <>
      <ComparablesTable
        propInfo={propInfo}
        targetProperty={targetProperty}
        comparablesPool={comparablesPool}
        headers={headers}
        Uuid={Uuid}
        setStep={setStep}
        setEstimate={setEstimate}
      />
    </>
  )
}

Comparables.propTypes = {
  comparablesPool: PropTypes.array,
  headers: PropTypes.array,
  propInfo: PropTypes.object,
  targetProperty: PropTypes.string,
  Uuid: PropTypes.string,
  setStep: PropTypes.func,
  setEstimate: PropTypes.func,
}

export default Comparables
