import React from "react"
import PropTypes from "prop-types"
import { Button, Divider, Table } from "antd"
import { Link } from "react-router-dom"
import PropertyInfo from "../../components/property-info"
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

const ReviewAppeal = ({
  city,
  target,
  userInfo,
  comparables,
  confirmInfo,
  back,
  files,
  onChangeFiles,
}) => (
  <>
    <h1>Your Appeal</h1>
    <p>
      Below is the information you submitted as part of your Application. If the
      information is correct, please click the blue button to finalize your
      Application.
    </p>
    <p>
      If you need to make changes to any of this information please use the
      “back button” to make those changes.
    </p>
    <h2>Your Property Information</h2>
    <p>Below is the data that the Assessor has on file for your property.</p>
    <PropertyInfo city={city} target={target} />
    <Divider />
    <h2>Your Information</h2>
    <Table
      dataSource={[userInfo]}
      columns={userCols}
      pagination={false}
      scroll={{ x: true }}
    />
    <Divider />
    <h2>Your Comparables</h2>
    <p>
      We automatically include comparables until five are selected here. This
      can be changed later.
    </p>
    <Table
      dataSource={comparables.map(cleanParcel)}
      columns={compCols}
      pagination={false}
      scroll={{ x: true }}
    />
    <Divider />
    <h2>Upload images</h2>
    <p>
      Upload any images of damage to your property that would impact your
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

ReviewAppeal.propTypes = {
  city: PropTypes.string,
  target: PropTypes.object,
  userInfo: PropTypes.object,
  comparables: PropTypes.array,
  files: PropTypes.array,
  onChangeFiles: PropTypes.func,
  confirmInfo: PropTypes.object,
  back: PropTypes.func,
}

export default ReviewAppeal
