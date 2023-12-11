import React, { useContext, useState } from "react"
import { Button, Divider, Table, Form, Input, Radio } from "antd"
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
  const [loading, setLoading] = useState(false)
  const appeal = useContext(AppealContext)
  const dispatch = useContext(AppealDispatchContext)
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const confirmInfo = async () => {
    setLoading(true)
    await submitAppeal(appeal)
    window.sessionStorage.removeItem(`appeal-${appeal.city}`)
    setLoading(false)
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
      <h2>Damage</h2>
      <Form
        form={form}
        name="damage"
        layout="vertical"
        autoComplete="off"
        size="large"
      >
        <Form.Item
          name="damage"
          label="Describe any damage to your property that would impact its value"
        >
          <Input.TextArea
            name="damage"
            value={appeal.damage}
            onChange={(e) => {
              dispatch({ type: "set-damage", damage: e.target.value })
            }}
          />
        </Form.Item>
        <Form.Item
          name="damage_level"
          label="If you've written about damage, how would you describe it on a scale of low to high?"
        >
          <Radio.Group name="damage_level">
            <Radio value="low">Low</Radio>
            <Radio value="medium">Medium</Radio>
            <Radio value="high">High</Radio>
          </Radio.Group>
        </Form.Item>
        {appeal.city !== "chicago" && (
          <FileUpload
            label="Click to upload images of the damage"
            accept="image/*,.heic,.heif"
            files={appeal.files}
            onChange={(files) => dispatch({ type: "set-files", files })}
          />
        )}
      </Form>
      <Divider />
      <Button
        disabled={loading}
        type="danger"
        onClick={() => navigate("../comparables")}
      >
        Back
      </Button>
      <Button disabled={loading} type="primary" onClick={confirmInfo}>
        Finalize Application
      </Button>
      <br></br>
      <br></br>
      <p>Page 5 of 5</p>
    </>
  )
}

export default ReviewAppeal
