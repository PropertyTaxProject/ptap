import React from 'react';
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

const HomeownerInfo = () => (
  <>
    <Row>
      <Col xs={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
        <h1>Homeowner Information</h1>
        <p>How should we contact you?</p>
        <br />
      </Col>
    </Row>
    <Form.Item
      name="name"
      label="Full Name"
      rules={[
        {
          required: true,
          message: 'Please input your full name!',
          whitespace: true,
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
          whitespace: true,
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
          whitespace: true,
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
          whitespace: true,
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
          whitespace: true,
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
          whitespace: true,
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
          whitespace: true,
        },
      ]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name="preferred"
      label="Preferred Contact Method:"
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
      </Radio.Group>
    </Form.Item>
  </>
);

const PropertyForm = (props) => {
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
        <Col xs={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
          <h1>Your Information </h1>
          <p>In order to properly file your appeal, we need your contact information and for you to verify information on your property.</p>
          <br />
        </Col>
      </Row>
      <Form.Item noStyle>
        {/* <PinForm /> */}
        <HomeownerInfo />
        {/*<CharacteristicsForm />*/}
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

export default PropertyForm;
