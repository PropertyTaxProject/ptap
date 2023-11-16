import React from "react"
import PropTypes from "prop-types"
import { Button, Divider, Table } from "antd"
import { Link } from "react-router-dom"
import PropertyInfo from "../shared/property-info"
import { cleanParcel } from "../../utils"
import { FileUpload } from "../../components/file-upload"

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
    dataIndex: "assessed_value_display",
    key: "assessed_value_display",
  },
  {
    title: "Sale Price (if available)",
    dataIndex: "sale_price_display",
    key: "sale_price_display",
  },
  {
    title: "Sale Date",
    dataIndex: "sale_date",
    key: "sale_date",
  },
]

const ReviewAppeal = (props) => {
  const {
    city,
    targetProperty,
    propInfo,
    userInfo,
    comparables,
    confirmInfo,
    back,
    files,
    onChangeFiles,
  } = props
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
        city={city}
        targetProperty={targetProperty}
        cols={5}
        propInfo={propInfo}
      />
      <Divider />
      <h1>Your Information</h1>
      <Table dataSource={[userInfo]} columns={userCols} />
      <h1>Your Comparables</h1>
      <p>
        We automatically include comparables until five are selected here. This
        can be changed later.
      </p>
      <Table dataSource={comparables.map(cleanParcel)} columns={compCols} />
      <h1>Upload images</h1>
      <p>
        Upload any images of damange to your property that would impact your
        assessed value.
      </p>
      <FileUpload
        accept="image/*,.heic,.heif"
        files={files}
        onChange={onChangeFiles}
      />
      <Divider />
      <Button type="danger" onClick={back}>
        Back
      </Button>
      <Button type="primary" onClick={confirmInfo}>
        <Link to="/completedappeal">Finalize Application</Link>
      </Button>
      <br></br>
      <br></br>
      <p>Page 5 of 5</p>
    </>
  )
}

ReviewAppeal.propTypes = {
  city: PropTypes.string,
  targetProperty: PropTypes.object,
  propInfo: PropTypes.object,
  userInfo: PropTypes.object,
  comparables: PropTypes.array,
  files: PropTypes.array,
  onChangeFiles: PropTypes.func,
  confirmInfo: PropTypes.object,
  back: PropTypes.func,
}

export default ReviewAppeal
