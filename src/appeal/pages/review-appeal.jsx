import React from "react"
import PropTypes from "prop-types"
import { Button, Divider, Table } from "antd"
import { Link } from "react-router-dom"
import PropertyInfo from "../shared/property-info"

const userCols = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Mailing Address",
    dataIndex: "address",
    key: "address",
  },
  {
    title: "City",
    dataIndex: "city",
    key: "city",
  },
  {
    title: "Zip Code",
    dataIndex: "zip",
    key: "zip",
  },
  {
    title: "Preferred Contact Method",
    dataIndex: "preferred",
    key: "preferred",
  },
  {
    title: "Phone",
    dataIndex: "phone",
    key: "phone",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
]

const compCols = [
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
  },
  {
    title: "Pin",
    dataIndex: "pin",
    key: "pin",
  },
  {
    title: "Assessed Value",
    dataIndex: "assessed_value",
    key: "assessed_value",
  },
  {
    title: "Sale Price (if available)",
    dataIndex: "Sale Price",
    key: "Sale Price",
  },
  {
    title: "Sale Date",
    dataIndex: "Sale Date",
    key: "Sale Date",
  },
]

const OtherInfo = (props) => {
  const { confirmInfo, userInfo, comparables, back } = props

  return (
    <>
      <h1>Your Information</h1>
      <Table dataSource={[userInfo]} columns={userCols} />
      <h1>Your Comparables</h1>
      <p>
        We automatically include comparables until five are selected here. This
        can be changed later.
      </p>
      <Table dataSource={comparables} columns={compCols} />
      <Button type="danger" onClick={back}>
        Back
      </Button>
      <Button type="primary" onClick={confirmInfo}>
        <Link to="/completedappeal">Finalize Application</Link>
      </Button>
    </>
  )
}

OtherInfo.propTypes = {
  confirmInfo: PropTypes.func,
  userInfo: PropTypes.object,
  comparables: PropTypes.array,
  back: PropTypes.func,
}

const ReviewAppeal = (props) => {
  const { targetProperty, propInfo, userInfo, comparables, confirmInfo, back } =
    props
  return (
    <>
      <h1>Your Appeal</h1>
      <p>
        Below is the information you submitted as part of your Application. If
        the information is correct, please click the blue button to finalize
        your Application.
      </p>
      <p>
        If you need to make changes to any of this information please use the
        “back button” to make those changes.
      </p>
      <PropertyInfo
        targetProperty={targetProperty}
        cols={5}
        propInfo={propInfo}
      />
      <Divider />
      <OtherInfo
        confirmInfo={confirmInfo}
        propInfo={propInfo}
        userInfo={userInfo}
        comparables={comparables}
        back={back}
      />
      <br></br>
      <br></br>
      <p>Page 5 of 5</p>
    </>
  )
}

ReviewAppeal.propTypes = {
  targetProperty: PropTypes.object,
  propInfo: PropTypes.object,
  userInfo: PropTypes.object,
  comparables: PropTypes.array,
  confirmInfo: PropTypes.object,
  back: PropTypes.func,
}

export default ReviewAppeal
