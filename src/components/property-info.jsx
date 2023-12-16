import React from "react"
import PropTypes from "prop-types"
import { Table, Alert } from "antd"
import { cleanParcel, DISPLAY_FIELDS, DISPLAY_FIELDS_COOK } from "../utils"

// displays the target property information
const PropertyInfo = ({ city, target }) => {
  const baseFields = ["chicago", "cook"].includes(city)
    ? DISPLAY_FIELDS_COOK
    : DISPLAY_FIELDS
  const fields = baseFields.filter(({ title }) => title !== "Distance")

  let additionalInfo = ""
  if (city === "detroit") {
    additionalInfo = (
      <>
        <p>
          Taxpayer of Record: {target.taxpayer}. Current Principal Residence
          Exemption (PRE) Exemption Status: {target.homestead_exemption}%.
        </p>
        {+target.homestead_exemption === 100 && (
          <Alert
            type="warning"
            message="We may not be able to assist with your property because it has a current exemption of 100%"
          />
        )}
      </>
    )
  }

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
      {additionalInfo}
    </>
  )
}

PropertyInfo.propTypes = {
  city: PropTypes.string,
  target: PropTypes.object,
}

export default PropertyInfo
