import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Button, Table } from "antd"

const PinChooser = ({
  headers,
  propertyOptions,
  onChange,
  max,
  isSelectLabels = false,
}) => {
  // TODO: Maybe manage state outside?
  const [selectedPins, setSelectedPins] = useState([])

  const maxOptions = max > 0 ? max : propertyOptions.length
  const [addLabel, removeLabel] = isSelectLabels
    ? ["Select", "Remove"]
    : ["Add", "Remove"]

  useEffect(() => {
    onChange(selectedPins)
  }, [selectedPins])

  return (
    <Table
      dataSource={propertyOptions.map(({ pin, ...data }) => ({
        ...data,
        pin,
        key: pin,
      }))}
      scroll={{ x: true }}
      pagination={false}
    >
      {headers.map(({ title, field }) => (
        <Table.Column title={title} dataIndex={field} key={field} />
      ))}
      <Table.Column
        title="Action"
        key="action"
        render={(record) => {
          const isSelected = selectedPins.includes(record.pin)
          return (
            <Button
              danger={isSelected}
              disabled={selectedPins.length >= maxOptions && !isSelected}
              onClick={() => {
                setSelectedPins(
                  isSelected
                    ? selectedPins.filter((pin) => record.pin != pin)
                    : [...selectedPins, record.pin]
                )
              }}
            >
              {isSelected ? removeLabel : addLabel}
            </Button>
          )
        }}
      />
    </Table>
  )
}

PinChooser.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.object),
  propertyOptions: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
  max: PropTypes.number,
  isSelectLabels: PropTypes.bool,
}

export default PinChooser
