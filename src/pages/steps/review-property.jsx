import React, { useContext, useState } from "react"
import { Form, Button, Row, Col, Space, Divider, Input, Radio } from "antd"
import PropertyInfo from "../../components/property-info"
import { AppealContext, AppealDispatchContext } from "../../context/appeal"
import { useNavigate } from "react-router-dom"

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
  const [showCharInput, updateCharInput] = useState(false)

  const onFinish = (info) => {
    console.log("Received values of form: ", info)
    dispatch({ type: "set-user-property", userProperty: info })
    navigate("../comparables")
  }

  return (
    <>
      <h1>Your Property Information</h1>
      <p>Below is the data that the Assessor has on file for your property.</p>
      <PropertyInfo city={appeal.city} target={appeal.target} cols={5} />
      <Divider />
      <Form
        form={form}
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
            <Button type="danger" onClick={() => navigate("../homeowner-info")}>
              Back
            </Button>
            <Button type="primary" htmlType="submit">
              Next Page
            </Button>
          </Space>
        </Form.Item>
      </Form>
      <Divider />
      <p>Page 3 of 5</p>
    </>
  )
}

export default ReviewProperty
