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
      name="PIN_Lookup"
      layout="vertical"
      onFinish={async (data) => {
        const res = await lookupPin({
          ...data,
          appeal_type: getAppealType(city),
        })
        onSearch(res)
      }}
      labelAlign="left"
      scrollToFirstError
      autoComplete="off"
      size="large"
    >
      <Input.Group compact>
        <Form.Item
          style={{ width: "100px" }}
          name="street_number"
          rules={[{ required: true, message: "Street number is required." }]}
        >
          <Input
            name="street_number"
            inputMode="numeric"
            placeholder="number"
          />
        </Form.Item>
        <Form.Item
          style={{ width: "300px" }}
          name="street_name"
          rules={[{ required: true, message: "Street name is required." }]}
        >
          <Input name="street_name" placeholder="street" />
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
