import React from "react"
import PropTypes from "prop-types"
import { lookupPin } from "../requests"
import { Form, Input, Button, Space } from "antd"

const PinLookup = ({ region, onSearch }) => {
  const [form] = Form.useForm()

  return (
    <Form
      form={form}
      name="PIN_Lookup"
      layout="vertical"
      onFinish={async (data) => {
        const res = await lookupPin(region, data.street_address)
        onSearch(res)
      }}
      labelAlign="left"
      scrollToFirstError
      autoComplete="off"
      size="large"
    >
      <Input.Group>
        <Space horizontal wrap>
          <Form.Item
            style={{ width: "300px", marginBottom: 0 }}
            name="street_address"
            rules={[{ required: true, message: "Street address is required." }]}
          >
            <Input name="street_address" placeholder="Street address" />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Search
          </Button>
        </Space>
      </Input.Group>
    </Form>
  )
}

PinLookup.propTypes = {
  region: PropTypes.string,
  onSearch: PropTypes.func,
}

export default PinLookup
