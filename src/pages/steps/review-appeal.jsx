import React, { useContext, useState } from "react"
import {
  Button,
  Divider,
  Table,
  Form,
  Input,
  Radio,
  Space,
  Row,
  Col,
} from "antd"
import PropertyInfo from "../../components/property-info"
import { cleanParcel, CONTACT_EMAIL } from "../../utils"
import { FileUpload } from "../../components/file-upload"
import { AppealContext, AppealDispatchContext } from "../../context/appeal"
import { useNavigate } from "react-router-dom"
import { submitAppeal } from "../../requests"

const formItemLayout = {
  labelCol: {
    span: 12,
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    md: {
      span: 12,
    },
  },
}
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
      <Row>
        <Col xs={{ span: 24, offset: 0 }} md={{ span: 12, offset: 0 }}>
          <h1>Your Appeal</h1>
          <p>
            Below is the information you submitted as part of your Application.
            If the information is correct, please click the blue button to
            finalize your Application.
          </p>
          <p>
            If you need to make changes to any of this information please use
            the “back button” to make those changes.
          </p>
          <h2>Your Property Information</h2>
          <p>
            Below is the data that the Assessor has on file for your property.
          </p>
        </Col>
      </Row>

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
        dataSource={appeal.selectedComparables.map(cleanParcel)}
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
        {...formItemLayout}
      >
        <Form.Item
          name="damage_level"
          rules={[
            { required: true, message: "You must select one of the options" },
          ]}
          label="To the best of your abilities, please pick a category that best describes the condition of your home. The Assessor uses these categories and criteria to rate the condition."
          help={` If you have any questions about how to categorize your home, please send us an email at ${CONTACT_EMAIL}.`}
        >
          <Radio.Group
            name="damage_level"
            onChange={(e) => {
              dispatch({
                type: "set-damage-level",
                damage_level: e.target.value,
              })
            }}
          >
            <Space direction="vertical">
              <Radio value="excellent">
                <strong>Excellent</strong>: Building is in perfect condition,
                very attractive and highly desirable
              </Radio>
              <Radio value="very_good">
                <strong>Very good</strong>: Slight evidence of deterioration,
                still attractive and quite desirable
              </Radio>
              <Radio value="good">
                <strong>Good</strong>: Minor deterioration visible, slightly
                less attractive and desirable, but useful
              </Radio>
              <Radio value="average">
                <strong>Average</strong>: Normal wear and tear is apparent,
                average attractiveness and desirability
              </Radio>
              <Radio value="fair">
                <strong>Fair</strong>: Marked deterioration, rather unattractive
                and undesirable but still quite useful
              </Radio>
              <Radio value="poor">
                <strong>Poor</strong>: Definite deterioration is obvious,
                definitely undesirable and barely usable
              </Radio>
              <Radio value="very_poor">
                <strong>Very poor</strong>: Condition approaches unsoundness,
                extremely undesirable and barely usable
              </Radio>
              <Radio value="unsound">
                <strong>Unsound</strong>: Building is definitely unsound and
                practically unfit for use
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        <br />
        <Form.Item
          name="damage"
          label="In support of the rating you selected for your home above, please describe the condition of your home below, including any damage to your property, both inside and out."
        >
          <Input.TextArea
            name="damage"
            value={appeal.damage}
            onChange={(e) => {
              dispatch({ type: "set-damage", damage: e.target.value })
            }}
          />
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
      <Space>
        <Button
          size="large"
          disabled={loading}
          type="danger"
          onClick={() => navigate("../comparables")}
        >
          Back
        </Button>
        <Button
          size="large"
          disabled={loading}
          type="primary"
          onClick={confirmInfo}
        >
          Finalize Application
        </Button>
      </Space>
      <Divider />
      <p>Page 5 of 5</p>
    </>
  )
}

export default ReviewAppeal
