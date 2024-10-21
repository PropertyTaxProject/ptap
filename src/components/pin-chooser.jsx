import React from "react"
import PropTypes from "prop-types"
import { Button, Table } from "antd"

const PinChooser = ({
  propertyOptions,
  pins,
  onChange,
  max,
  headers,
  onChangePrimary,
  primary = null,
  isSelectLabels = false,
  includePrimary = false,
}) => {
  const maxOptions = max > 0 ? max : propertyOptions.length
  const [addLabel, removeLabel] = isSelectLabels
    ? ["Select", "Remove"]
    : ["Add", "Remove"]

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
          const isSelected = pins.includes(record.pin)
          return (
            <Button
              danger={isSelected}
              disabled={pins.length >= maxOptions && !isSelected}
              onClick={() => {
                onChange(
                  isSelected
                    ? pins.filter((pin) => record.pin != pin)
                    : [...pins, record.pin]
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
