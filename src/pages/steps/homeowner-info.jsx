import React, { useState, useContext } from "react"
import { Form, Input, Button, Radio, Space, Select, Divider } from "antd"
import { getAppealType, getPageLabel } from "../../utils"
const { Option } = Select
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

const getInitialFormData = ({ user, target, city: appealCity }) => {
  const state = appealCity === "detroit" ? "MI" : "IL"
  let { address, city, zip } = target || {}
  city = appealCity === "detroit" ? "Detroit" : city
  const targetProps = { address, city, zip, state }
  return { ...targetProps, ...user }
}

const HomeownerInfo = () => {
  const appeal = useContext(AppealContext)
  const dispatch = useContext(AppealDispatchContext)
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [showMailingAddr, updateMailingAddr] = useState(false)
  const [showAltContact, updateAltContact] = useState(false)
  const [heardAbout, updateHeardAbout] = useState(null)

  const onFinish = async (values) => {
    const info = {
      ...values,
      pin: appeal.pin,
      appeal_type: getAppealType(appeal.city),
      eligibility: appeal.eligible,
      uuid: appeal.uuid,
    }
    console.log("Received values of form: ", info)
    const res = await submitForm(info)

    // TODO: Add an action to set on change as well?
    dispatch({
      type: "set-homeowner-info",
      user: info,
      comparables: res.comparables,
      headers: res.labeled_headers,
      target: res.target_pin[0],
      propertyInfo: res.prop_info,
    })
    navigate("../agreement")
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

        <Form.Item name="zip" label="Zip Code">
          <Input name="zip" />
        </Form.Item>

        <Form.Item
          name="mailingsame"
          label="Is your mailing address is the same as your home address?"
          rules={[
            {
              required: true,
              message: "Please respond",
            },
          ]}
        >
          <Radio.Group
            name="mailingsame"
            onChange={(e) => updateMailingAddr(e.target.value)}
          >
            <Radio value={"Yes"}>Yes</Radio>
            <Radio value={"No"}>No</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="mailingaddress"
          label="Enter your Mailing Address"
          style={
            showMailingAddr === "No" ? { display: "" } : { display: "none" }
          }
        >
          {showMailingAddr === "No" && (
            <Input
              name="mailingaddress"
              placeholder="Please enter your mailing address"
            />
          )}
        </Form.Item>

        <Form.Item
          name="altcontact"
          label="Did someone help you fill out this form?"
          rules={[
            {
              required: true,
              message: "Please respond",
            },
          ]}
        >
          <Radio.Group
            name="altcontact"
            onChange={(e) => updateAltContact(e.target.value)}
          >
            <Radio value={"Yes"}>Yes</Radio>
            <Radio value={"No"}>No</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="altcontactname"
          label={
            <p>
              Enter{" "}
              <strong>
                <i>their</i>
              </strong>{" "}
              name
            </p>
          }
          style={
            showAltContact === "Yes" ? { display: "" } : { display: "none" }
          }
        >
          {showAltContact === "Yes" && (
            <Input
              name="altcontactname"
              placeholder="Please enter their name"
            />
          )}
        </Form.Item>

        <Form.Item
          name="altcontactrelationship"
          label={
            <p>
              What is your relationship with{" "}
              <strong>
                <i>them</i>
              </strong>
              ?
            </p>
          }
          style={
            showAltContact === "Yes" ? { display: "" } : { display: "none" }
          }
        >
          {showAltContact === "Yes" && (
            <Input
              name="altcontactrelationship"
              placeholder="Please enter your relationship"
            />
          )}
        </Form.Item>

        <Form.Item
          name="altcontactemail"
          label={
            <p>
              What is{" "}
              <strong>
                <i>their</i>
              </strong>{" "}
              email address?
            </p>
          }
          style={
            showAltContact === "Yes" ? { display: "" } : { display: "none" }
          }
        >
          {showAltContact === "Yes" && (
            <Input
              name="altcontactemail"
              placeholder="Please enter their email"
            />
          )}
        </Form.Item>

        <Form.Item
          name="altcontactphone"
          label={
            <p>
              What is{" "}
              <strong>
                <i>their</i>
              </strong>{" "}
              phone number?
            </p>
          }
          style={
            showAltContact === "Yes" ? { display: "" } : { display: "none" }
          }
        >
          {showAltContact === "Yes" && (
            <Input
              name="altcontactphone"
              placeholder="Please enter their phone number"
            />
          )}
        </Form.Item>

        <Form.Item
          name="altcontactpreferred"
          label={
            <p>
              What is{" "}
              <strong>
                <i>their</i>
              </strong>{" "}
              preferred contact method?
            </p>
          }
          style={
            showAltContact === "Yes" ? { display: "" } : { display: "none" }
          }
        >
          {showAltContact === "Yes" && (
            <Radio.Group name="altcontactpreferred">
              <Radio value="Phone">Phone</Radio>
              <Radio value="Email">Email</Radio>
              <Radio value="Both">Both/No Preference</Radio>
            </Radio.Group>
          )}
        </Form.Item>

        <Form.Item
          name="heardabout"
          label="How did you hear about us?"
          rules={[
            {
              required: true,
              message: "Please select from the dropdown options",
            },
          ]}
        >
          <Select name="heardabout" onChange={(v) => updateHeardAbout(v)}>
            <Option value="local">Local Organization</Option>
            <Option value="social media">
              Social Media (Facebook, Instagram, or Twitter)
            </Option>
            <Option value="text">Text Message</Option>
            <Option value="newspaper">From the news</Option>
            <Option value="referral">
              From a friend, neighbor, or family member
            </Option>
            <Option value="phone">Phone call</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        {heardAbout === "social media" && (
          <>
            <Form.Item
              name="socialmedia"
              label="Social media platform"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select name="socialmedia">
                <Option value="facebook">Facebook</Option>
                <Option value="instagram">Instagram</Option>
                <Option value="twitter">Twitter</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="socialmediainput"
              label="Whose social media did you learn about us from?"
            >
              <Input name="socialmediainput" placeholder="Organization" />
            </Form.Item>
          </>
        )}

        {heardAbout === "local" && (
          <Form.Item
            name="localinput"
            label="What organization told you about us?"
          >
            <Input name="localinput" placeholder="Organization" />
          </Form.Item>
        )}

        {heardAbout === "referral" && (
          <Form.Item
            name="referralinput"
            label="Who referred you?"
            rules={[{ required: true }]}
          >
            <Input
              name="referralinput"
              placeholder="Please enter who referred you"
            />
          </Form.Item>
        )}

        {heardAbout === "other" && (
          <Form.Item
            name="otherheardaboutinput"
            label="Please enter how you heard about us"
            rules={[{ required: true }]}
          >
            <Input
              name="otherheardaboutinput"
              placeholder="Please how you heard about us"
            />
          </Form.Item>
        )}

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
      <p>{getPageLabel("homeowner-info")}</p>
    </>
  )
}

export default HomeownerInfo
