import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Button, Table } from "antd"

const PinChooser = ({
  propertyOptions,
  onChange,
  max,
  headers,
  onChangePrimary,
  primary = null,
  pins = [],
  isSelectLabels = false,
  includePrimary = false,
}) => {
  const [selectedPins, setSelectedPins] = useState(pins)

  const maxOptions = max > 0 ? max : propertyOptions.length
  const [addLabel, removeLabel] = isSelectLabels
    ? ["Select", "Remove"]
    : ["Add", "Remove"]

  useEffect(() => {
    if (JSON.stringify(pins) !== JSON.stringify(selectedPins)) {
      setSelectedPins(pins)
    }
  }, [pins])

  useEffect(() => {
    if (JSON.stringify(pins) !== JSON.stringify(selectedPins)) {
      onChange(selectedPins)
    }
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
      {includePrimary && (
        <Table.Column
          title="Primary"
          key="primary"
          render={(record) => {
            const isSelected = primary === record.pin
            return (
              <Button
                danger={isSelected}
                disabled={primary && !isSelected}
                onClick={() => onChangePrimary(isSelected ? null : record.pin)}
              >
                {isSelected ? "Remove primary" : "Set primary"}
              </Button>
            )
          }}
        />
      )}
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
  pins: PropTypes.arrayOf(PropTypes.string),
  isSelectLabels: PropTypes.bool,
  onChangePrimary: PropTypes.func,
  primary: PropTypes.string,
  includePrimary: PropTypes.bool,
}

export default PinChooser
