import React, { useContext } from "react"
import { Form, Input, Button, Radio, Space, Divider } from "antd"
import { getPageLabel } from "../../utils"
import { AppealContext, AppealDispatchContext } from "../../context/appeal"
import { useNavigate } from "react-router-dom"
import { submitForm } from "../../requests"

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
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 24,
      offset: 0,
    },
  },
}

const nameFieldsLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 24,
      offset: 0,
    },
    md: {
      span: 24,
      offset: 0,
    },
    lg: {
      span: 24,
    },
  },
}

const getInitialFormData = ({ user, target, region }) => {
  const regionMap = {
    detroit: "Detroit",
    cook: "Chicago",
    milwaukee: "Milwaukee",
  }
  const stateMap = {
    detroit: "MI",
    cook: "IL",
    milwaukee: "WI",
  }
  const state = stateMap[region]
  let { address, city } = target || {}
  if (regionMap[region.toLowerCase().trim()]) {
    city = regionMap[region.toLowerCase().trim()]
  }
  const targetProps = { address, city, state }
  return { ...targetProps, ...user }
}

const HomeownerInfo = () => {
  const appeal = useContext(AppealContext)
  const dispatch = useContext(AppealDispatchContext)
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const onFinish = async () => {
    // Force it to re-check fields, hopefully addressing iOS autofill
    const values = await form.validateFields()
    const info = {
      ...values,
      pin: appeal.pin,
      uuid: appeal.uuid,
    }
    console.log("Received values of form: ", info)
    const res = await submitForm({
      ...appeal,
      user: { ...appeal.user, ...values },
    })

    if (window.fbq) {
      window.fbq("track", "CompleteRegistration")
    }

    // TODO: Add an action to set on change as well?
    dispatch({
      type: "set-homeowner-info",
      user: values,
      comparables: res.comparables || [],
      target: res.target,
    })
    if (appeal.region === "milwaukee") {
      navigate("../mke-agreement")
    } else {
      navigate("../review-property")
    }
  }

  return (
    <>
      <h1>Homeowner Contact Information</h1>
      <Form
        form={form}
        initialValues={getInitialFormData(appeal)}
        name="Housing_Information"
        onFinish={onFinish}
        labelAlign="left"
        scrollToFirstError
        autoComplete="off"
        size="large"
        {...formItemLayout}
      >
        <Input.Group compact labelCol={{ sm: 24, xs: 24, md: 24 }}>
          <Form.Item
            name="first_name"
            label="First name"
            rules={[
              {
                required: true,
                message: "Please input your first name",
              },
            ]}
            {...nameFieldsLayout}
          >
            <Input name="first_name" />
          </Form.Item>
          <Form.Item
            name="last_name"
            label="Last name"
            rules={[
              {
                required: true,
                message: "Please input your last name",
              },
            ]}
            {...nameFieldsLayout}
          >
            <Input name="last_name" />
          </Form.Item>
        </Input.Group>
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            {
              required: true,
              message: "Please input your email",
              type: "email",
            },
          ]}
        >
          <Input name="email" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            {
              required: true,
              message: "Please input your phone number",
            },
          ]}
        >
          <Input name="phone" />
        </Form.Item>

        <Form.Item
          name="phonetype"
          label="Can we text you at this number?"
          rules={[
            {
              message: "Please mark your phone type",
              whitespace: true,
            },
          ]}
        >
          <Radio.Group name="phonetype">
            <Radio value="Cell">Yes</Radio>
            <Radio value="Home">No</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="address"
          label="Street Address"
          rules={[
            {
              required: true,
              message: "Please input your street address",
            },
          ]}
        >
          <Input name="address" />
        </Form.Item>

        <Form.Item
          name="city"
          label="City"
          rules={[
            {
              required: true,
              message: "Please input your city",
            },
          ]}
        >
          <Input name="city" />
        </Form.Item>

        <Form.Item
          name="state"
          label="State"
          rules={[
            {
              required: true,
              message: "Please input your State",
            },
          ]}
        >
          <Input name="state" />
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
          <Space>
            <Button type="danger" onClick={() => navigate("../")}>
              Back
            </Button>
            <Button type="primary" htmlType="submit">
              Next Page
            </Button>
          </Space>
        </Form.Item>
      </Form>
      <Divider />
      <p>{getPageLabel("homeowner-info", appeal)}</p>
    </>
  )
}

export default HomeownerInfo
