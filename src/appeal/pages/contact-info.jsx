import React, { useState } from "react"
import PropTypes from "prop-types"
import { Form, Input, Button, Radio, Row, Col, Space, Select } from "antd"

const { Option } = Select

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

const ContactInfo = (props) => {
  const [form] = Form.useForm()
  const { onFinish, back } = props
  const [showMailingAddr, updateMailingAddr] = useState(false)
  const [showAltContact, updateAltContact] = useState(false)
  const [showReferral, updateReferral] = useState(false)

  return (
    <>
      <Row>
        <Col xs={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
          <h1>Homeowner Contact Information</h1>
          <p>
            We will try to contact you three times on three separate days after
            you fill out this form. If we do not hear from you within 72 hours
            of our last attempt, we will remove you from our list. Please note:
            when deadlines are approaching, we may only try to contact you once
            or twice. The appeals season is very short which means you must
            communicate promptly.
          </p>
          <p>How should we contact you?</p>
        </Col>
      </Row>
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
        <Form.Item
          name="name"
          label="Full Name (First, Middle, Last)"
          rules={[
            {
              required: true,
              message: "Please input your full name!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            {
              required: true,
              message: "Please input your Email!",
              type: "email",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            {
              required: true,
              message: "Please input your phone number!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="phonetype"
          label="Can we text you at this number?"
          rules={[
            {
              required: true,
              message: "Please mark your phone type!",
              whitespace: true,
            },
          ]}
        >
          <Radio.Group>
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
              message: "Please input your street address!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="city"
          label="City"
          rules={[
            {
              required: true,
              message: "Please input your city!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="state"
          label="State"
          rules={[
            {
              required: true,
              message: "Please input your State!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="zip"
          label="Zip Code"
          rules={[
            {
              required: true,
              message: "Please input your zip code!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="mailingsame"
          label="Is your mailing address is the same as your home address?"
          rules={[
            {
              required: true,
              message: "Please respond!",
            },
          ]}
        >
          <Radio.Group onChange={(e) => updateMailingAddr(e.target.value)}>
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
            <Input placeholder="Please enter your mailing address" />
          )}
        </Form.Item>

        <Form.Item
          name="altcontact"
          label="Did someone help you fill out this form?"
          rules={[
            {
              required: true,
              message: "Please respond!",
            },
          ]}
        >
          <Radio.Group onChange={(e) => updateAltContact(e.target.value)}>
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
            <Input placeholder="Please enter their name" />
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
            <Input placeholder="Please enter your relationship" />
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
            <Input placeholder="Please enter their email" />
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
            <Input placeholder="Please enter their phone number" />
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
            <Radio.Group>
              <Radio value="Phone">Phone</Radio>
              <Radio value="Email">Email</Radio>
              <Radio value="Both">Both/No Preference</Radio>
            </Radio.Group>
          )}
        </Form.Item>

        <Form.Item
          name="phonetime"
          label="What time of day are you usually available to talk on the phone?"
          rules={[
            {
              required: true,
              message: "Please mark your time!",
              whitespace: true,
            },
          ]}
        >
          <Radio.Group>
            <Radio value="morning">Morning (before 11 a.m.)</Radio>
            <Radio value="midday">Midday (between 11 a.m. and 2 p.m.)</Radio>
            <Radio value="afternoon">
              Afternoon (between 2 p.m. and 6 p.m.)
            </Radio>
            <Radio value="evening">Evening (between 6 p.m. and 8 p.m.)</Radio>
            <Radio value="anytime">Anytime</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="heardabout"
          label="How did you hear about us?"
          rules={[
            {
              required: true,
              message: "Please select from the dropdown options!",
            },
          ]}
        >
          <Select onChange={(e) => updateReferral(e)}>
            <Option value="local">Local Organization</Option>
            <Option value="social media">
              Social Media (Facebook, Instagram, or Twitter)
            </Option>
            <Option value="text">Text Message</Option>
            <Option value="newspaper">Newspaper Article</Option>
            <Option value="referral">Referral</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="referralinput"
          label="Who referred you?"
          style={
            showReferral === "referral" ? { display: "" } : { display: "none" }
          }
        >
          {showReferral === "referral" && (
            <Input placeholder="Please enter who referred you" />
          )}
        </Form.Item>

        <Form.Item
          name="otherheardaboutinput"
          label="Please enter how you heard about us"
          style={
            showReferral === "other" ? { display: "" } : { display: "none" }
          }
        >
          {showReferral === "other" && (
            <Input placeholder="Please how you heard about us" />
          )}
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
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
    </>
  )
}

ContactInfo.propTypes = {
  onFinish: PropTypes.func,
  back: PropTypes.func,
}

const HomeownerInfo = (props) => {
  const { submitForm, city, pin, eligibility, uuid, back } = props

  const onFinish = (values) => {
    let appealType
    if (city === "detroit") {
      appealType = "detroit_single_family"
    } else if (city === "chicago") {
      appealType = "cook_county_single_family"
    }
    const info = { ...values, pin, appeal_type: appealType, eligibility, uuid }
    console.log("Received values of form: ", info)
    submitForm(info)
  }

  return (
    <>
      <ContactInfo onFinish={onFinish} back={back} />
      <p>Page 2 of 5</p>
    </>
  )
}

HomeownerInfo.propTypes = {
  submitForm: PropTypes.func,
  city: PropTypes.string,
  pin: PropTypes.string,
  eligibility: PropTypes.string,
  uuid: PropTypes.string,
  back: PropTypes.func,
}

export default HomeownerInfo
