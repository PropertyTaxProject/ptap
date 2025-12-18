import React, { useContext, useState } from "react"
import { Form, Button, Row, Col, Space, Divider, Input, Radio } from "antd"
import PropertyInfo from "../../components/property-info"
import { AppealContext, AppealDispatchContext } from "../../context/appeal"
import { useNavigate } from "react-router-dom"
import { getPageLabel, getProjectConfig } from "../../utils"

const { TextArea } = Input

const formItemLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 20,
    },
    md: {
      span: 18,
    },
    lg: {
      span: 14,
    },
  },
}

const ReviewProperty = () => {
  const appeal = useContext(AppealContext)
  const dispatch = useContext(AppealDispatchContext)
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [showCharInput, updateCharInput] = useState(
    appeal.property?.validcharacteristics
  )
  const projectConfig = getProjectConfig(appeal.region)

  const onFinish = (info) => {
    console.log("Received values of form: ", info)
    dispatch({ type: "set-user-property", property: info })
    navigate(
      !projectConfig.showComparables && !appeal.resumed
        ? "../damage"
        : "../comparables"
    )
  }

  return (
    <>
      <h1>Your Property Information</h1>
      <p>Below is the data that the Assessor has on file for your property.</p>
      <PropertyInfo region={appeal.region} target={appeal.target} cols={5} />
      <Divider />
      <Form
        form={form}
        initialValues={appeal.property}
        name="Housing_Information"
        onFinish={onFinish}
        labelAlign="left"
        scrollToFirstError
        autoComplete="off"
        size="large"
        {...formItemLayout}
      >
        <Row>
          <Col xs={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}></Col>
        </Row>
        <Form.Item
          name="validcharacteristics"
          rules={[{ required: true, message: "Your response is required." }]}
          label="Is this information about your property correct?"
        >
          <Radio.Group
            name="validcharacteristics"
            onChange={(e) => updateCharInput(e.target.value)}
          >
            <Radio value="Yes">Yes</Radio>
            <Radio value="No">No</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="characteristicsinput"
          label="What about this information is incorrect?"
          style={showCharInput === "No" ? { display: "" } : { display: "none" }}
        >
          {showCharInput === "No" && (
            <TextArea
              name="characteristicsinput"
              placeholder="Please provide as much information as you can."
              rows={4}
            />
          )}
        </Form.Item>

        <Form.Item
          name="valueestimate"
          label="How much do you think your house would sell for right now, as is? (If you are not sure, that's okay! Go ahead and provide a best guess)"
        >
          <Input name="valueestimate" placeholder="Your best estimate." />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="danger"
              onClick={() =>
                // TODO: Abstract out navigation
                navigate(
                  appeal.region === "detroit"
                    ? "../agreement"
                    : "../homeowner-info"
                )
              }
            >
              Back
            </Button>
            <Button type="primary" htmlType="submit">
              Next Page
            </Button>
          </Space>
        </Form.Item>
      </Form>
      <Divider />
      <p>{getPageLabel("review-property", appeal)}</p>
    </>
  )
}

export default ReviewProperty
