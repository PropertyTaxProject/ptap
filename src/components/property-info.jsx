import React from "react"
import PropTypes from "prop-types"
import { Table } from "antd"
import { cleanParcel, DISPLAY_FIELDS, DISPLAY_FIELDS_COOK } from "../utils"

// displays the target property information
const PropertyInfo = ({ city, target }) => {
  const baseFields = ["chicago", "cook"].includes(city)
    ? DISPLAY_FIELDS_COOK
    : DISPLAY_FIELDS
  const fields = baseFields.filter(({ title }) => title !== "Distance")

  return (
    <>
      <Table
        dataSource={[cleanParcel(target)]}
        pagination={false}
        scroll={{ x: true }}
      >
        {fields.map(({ title, field }) => (
          <Table.Column title={title} dataIndex={field} key={field} />
        ))}
      </Table>
      <br />
    </>
  )
}

PropertyInfo.propTypes = {
  city: PropTypes.string,
  target: PropTypes.object,
}

export default PropertyInfo
