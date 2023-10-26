import React, { useState } from "react"
import PropTypes from "prop-types"
import { submitEstimate, submitEstimate2 } from "../../requests"
import { Form, Button, Table, Divider } from "antd"
import { cleanParcel, DISPLAY_FIELDS } from "../../utils"

const Comparables = (props) => {
  const {
    comparablesPool,
    propInfo,
    targetProperty,
    Uuid,
    setStep,
    setEstimate,
  } = props

  const candidates = comparablesPool.map(cleanParcel)
  const [selectedComparables, setSelected] = useState([])
  const [form] = Form.useForm()

  const showSelected = selectedComparables.length > 0

  const targetColumns = DISPLAY_FIELDS.filter(
    ({ title }) => title !== "Distance"
  ).map(({ title, field }) => (
    <Table.Column title={title} dataIndex={field} key={field} />
  ))
  const comparableColumns = DISPLAY_FIELDS.map(({ title, field }) => (
    <Table.Column title={title} dataIndex={field} key={field} />
  ))

  return (
    <>
      <h2>
        Step 3. Compare the City’s estimate of your property’s MARKET VALUE to
        the SALES PRICES of homes that have recently sold in your neighborhood.
        If the market value of your property is HIGHER than the sales prices of
        similar homes, the City is over assessing your property value.
      </h2>
      <p>Below is the data that the Assessor has on file for your property.</p>
      <Table dataSource={[cleanParcel(targetProperty)]} scroll={{ x: true }}>
        {targetColumns}
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
        <i>
          Tip: Make sure the property you select is not in much worse condition
          than your home. If you can, walk or drive by the property to check it
          out.
        </i>
      </p>
      <Table dataSource={candidates} scroll={{ x: true }}>
        {comparableColumns}
        <Table.Column
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

Comparables.propTypes = {
  comparablesPool: PropTypes.array,
  headers: PropTypes.array,
  propInfo: PropTypes.object,
  targetProperty: PropTypes.object,
  Uuid: PropTypes.string,
  setStep: PropTypes.func,
  setEstimate: PropTypes.func,
}

export default Comparables
