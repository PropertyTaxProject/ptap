import React, { useContext } from "react"
import { Button, Divider, Table } from "antd"
import PropertyInfo from "../../components/property-info"
import { cleanParcel } from "../../utils"
import { FileUpload } from "../../components/file-upload"
import { AppealContext, AppealDispatchContext } from "../../context/appeal"
import { useNavigate } from "react-router-dom"
import { submitAppeal } from "../../requests"

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

const ReviewAppeal = () => {
  const appeal = useContext(AppealContext)
  const dispatch = useContext(AppealDispatchContext)
  const navigate = useNavigate()

  const confirmInfo = async () => {
    await submitAppeal(
      appeal.target,
      appeal.selectedComparables,
      appeal.user,
      appeal.userProperty,
      appeal.uuid,
      appeal.files
    )
    window.sessionStorage.removeItem("appeal")
    dispatch({ type: "complete" })
    navigate("../complete")
  }

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
      <h2>Your Property Information</h2>
      <p>Below is the data that the Assessor has on file for your property.</p>
      <PropertyInfo city={appeal.city} target={appeal.target} />
      <Divider />
      <h2>Your Information</h2>
      <Table
        dataSource={[appeal.user]}
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
        dataSource={appeal.comparables.map(cleanParcel)}
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
        files={appeal.files}
        onChange={(files) => dispatch({ type: "set-files", files })}
      />
      <Divider />
      <Button type="danger" onClick={() => navigate("../comparables")}>
        Back
      </Button>
      <Button type="primary" onClick={confirmInfo}>
        Finalize Application
      </Button>
      <br></br>
      <br></br>
      <p>Page 5 of 5</p>
    </>
  )
}

export default ReviewAppeal
