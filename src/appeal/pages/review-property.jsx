import React, { useState } from "react"
import PropTypes from "prop-types"
import { Form, Button, Row, Col, Space, Divider, Input, Radio } from "antd"
import PropertyInfo from "../shared/property-info"

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

const Characteristics = (props) => {
  const { city, targetProperty, submitPropReview, back } = props

  const [form] = Form.useForm()
  const [showCharInput, updateCharInput] = useState(false)

  const onFinish = (info) => {
    console.log("Received values of form: ", info)
    submitPropReview(info)
  }

  return (
    <>
      <PropertyInfo city={city} targetProperty={targetProperty} cols={5} />
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
          <Radio.Group onChange={(e) => updateCharInput(e.target.value)}>
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
              placeholder="Please provide as much information as you can."
              rows={4}
            />
          )}
        </Form.Item>

        <Form.Item
          name="valueestimate"
          label="How much do you think your house would sell for right now, as is? (If you are not sure, go ahead and provide an estimate)"
        >
          <Input placeholder="Your best estimate." />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="danger" onClick={back}>
              Back
            </Button>
            <Button type="primary" htmlType="submit">
              Next Page
            </Button>
          </Space>
        </Form.Item>
      </Form>
      <p>Page 3 of 5</p>
    </>
  )
}

Characteristics.propTypes = {
  city: PropTypes.string,
  targetProperty: PropTypes.string,
  submitPropReview: PropTypes.func,
  back: PropTypes.func,
}

export default Characteristics
