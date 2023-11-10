import React from "react"
import PropTypes from "prop-types"
import { Table } from "antd"

// TODO: move the distance filter outside?
const TargetProperty = (props) => (
  <Table dataSource={[props.comparables]} scroll={{ x: true }}>
    {headers
      .filter(({ title }) => title !== "Distance")
      .map(({ title, field }) => (
        <Table.Column title={title} dataIndex={field} key={field} />
      ))}
  </Table>
)

TargetProperty.propTypes = {
  property: PropTypes.object,
  headers: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
}

export default TargetProperty
