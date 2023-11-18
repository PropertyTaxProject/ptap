import React from "react"
import PropTypes from "prop-types"
import { lookupPin } from "../requests"
import { Form, Input, Button } from "antd"
import { getAppealType } from "../utils"

const PinLookup = ({ city, onSearch }) => {
  const [form] = Form.useForm()

  return (
    <Form
      form={form}
      name="PIN Lookup"
      layout="vertical"
      onFinish={async (data) => {
        const { candidates } = await lookupPin({
          ...data,
          appeal_type: getAppealType(city),
        })
        onSearch(candidates)
      }}
      labelAlign="left"
      scrollToFirstError
      autoComplete="off"
      size="large"
    >
      <p style={{ width: "350px" }}>
        Enter your street number and street name.
      </p>

      <Input.Group compact>
        <Form.Item
          style={{ width: "100px" }}
          name="street_number"
          rules={[{ required: true, message: "Street number is required." }]}
        >
          <Input inputMode="numeric" placeholder="number" />
        </Form.Item>
        <Form.Item
          style={{ width: "300px" }}
          name="street_name"
          rules={[{ required: true, message: "Street name is required." }]}
        >
          <Input placeholder="street" />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Search
        </Button>
      </Input.Group>
    </Form>
  )
}

PinLookup.propTypes = {
  city: PropTypes.string,
  onSearch: PropTypes.func,
}

export default PinLookup
