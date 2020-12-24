import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Radio,
  Row,
  Col,
  Space,
} from 'antd';

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
};
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
};

const ContactInfo = () => {
  const [form] = Form.useForm();

  const [showMailingAddr, updateMailingAddr] = useState(false);
  const [showAltContact, updateAltContact] = useState(false);
  return (
    <>
      <Row>
        <Col xs={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
          <h1>Homeowner Information</h1>
          <p>How should we contact you?</p>
        </Col>
      </Row>
      <Form
      form={form}
      {...formItemLayout}
      >
        <Form.Item
          name="name"
          label="Full Name"
          rules={[
            {
              required: true,
              message: 'Please input your full name!',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              required: true,
              message: 'Please input your Email!',
              type: 'email',
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
              message: 'Please input your phone number!',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="address"
          label="Street Address"
          rules={[
            {
              required: true,
              message: 'Please input your street address!',
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
              message: 'Please input your city!',
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
              message: 'Please input your State!',
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
              message: 'Please input your zip code!',
            },
          ]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          name="mailingsame"
          label="My mailing address is the same as my street address"
          rules={[
            {
              required: true,
              message: 'Please respond!',
            },
          ]}
        >
          <Radio.Group onChange={e => updateMailingAddr(e.target.value)}>
            <Radio value={'Yes'}>Yes</Radio>
            <Radio value={'No'}>No</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="mailingaddress"
          label="Enter your Mailing Address"
          style={showMailingAddr === 'No' ? { display: ''} : {display: 'none'}}
        >
          {showMailingAddr === 'No' && <Input placeholder="Please enter your mailing address" />}
        </Form.Item>

        <Form.Item
          name="altcontact"
          label="Did someone help you fill out this form?"
          rules={[
            {
              required: true,
              message: 'Please respond!',
            },
          ]}
        >
          <Radio.Group onChange={e => updateAltContact(e.target.value)}>
            <Radio value={'Yes'}>Yes</Radio>
            <Radio value={'No'}>No</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="altcontactname"
          label={<p>Enter <strong><i>their</i></strong> name</p>}
          style={showAltContact === 'Yes' ? { display: ''} : {display: 'none'}}
        >
          {showAltContact === 'Yes' && <Input placeholder="Please enter their name" />}
        </Form.Item>

        <Form.Item
          name="altcontactrelationship"
          label={<p>What is your relationship with <strong><i>them</i></strong>?</p>}
          style={showAltContact === 'Yes' ? { display: ''} : {display: 'none'}}
        >
          {showAltContact === 'Yes' && <Input placeholder="Please enter your relationship" />}
        </Form.Item>

        <Form.Item
          name="altcontactemail"
          label={<p>What is <strong><i>their</i></strong> email address?</p>}
          style={showAltContact === 'Yes' ? { display: ''} : {display: 'none'}}
        >
          {showAltContact === 'Yes' && <Input placeholder="Please enter their email" />}
        </Form.Item>

        <Form.Item
          name="altcontactphone"
          label={<p>What is <strong><i>their</i></strong> phone number?</p>}
          style={showAltContact === 'Yes' ? { display: ''} : {display: 'none'}}
        >
          {showAltContact === 'Yes' && <Input placeholder="Please enter their phone number" />}
        </Form.Item>

        <Form.Item
          name="altcontactpreferred"
          label={<p>What is <strong><i>their</i></strong> preferred contact method?</p>}
          style={showAltContact === 'Yes' ? { display: ''} : {display: 'none'}}
        >
          {showAltContact === 'Yes' && 
            <Radio.Group>
              <Radio value='Phone'>Phone</Radio>
              <Radio value='Email'>Email</Radio>
              <Radio value='Both'>Both/No Preference</Radio>
            </Radio.Group>
          }
        </Form.Item>

        <Form.Item
          name="preferred"
          label="What is your preferred contact method?"
          rules={[
            {
              required: true,
              message: 'Please mark your preferred method!',
              whitespace: true,
            },
          ]}
        >
          <Radio.Group>
            <Radio value='Phone'>Phone</Radio>
            <Radio value='Email'>Email</Radio>
            <Radio value='Both'>Both/No Preference</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="heardabout"
          label="How did you hear about us?"
        >
          <Input placeholder='Enter how you heard about us.'></Input>
        </Form.Item>
      </Form>
    </>
  )
};

const HomeownerInfo = (props) => {
  const [form] = Form.useForm();
  const { submitForm, city, pin, eligibility, uuid } = props;

  const onFinish = (values) => {
    let appealType;
    if (city === 'detroit') {
      appealType = 'detroit_single_family';
    } else if (city === 'chicago') {
      appealType = 'cook_county_single_family';
    }
    const info = { ...values, pin, appeal_type: appealType, eligibility, uuid };
    console.log('Received values of form: ', info);
    submitForm(info);
  };

  return (
    <Form
      form={form}
      name="Housing Information"
      onFinish={onFinish}
      labelAlign="left"
      scrollToFirstError
      autoComplete="off"
      {...formItemLayout}
    >
      <Row>
        <Col xs={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}></Col>
      </Row>
      <Form.Item noStyle>
        <ContactInfo/>
      </Form.Item>
      <Form.Item {...tailFormItemLayout}>
        <Space>
          <Button type="danger" onClick={props.back} >Back</Button>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default HomeownerInfo;
