import React from 'react';
import {
  Form,
  Input,
  Button,
  Row,
  Col,
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
  </>
);

const PinForm = () => (
  <Form.Item
    name="pin"
    label="Pin"
    rules={[
      {
        required: true,
        message: 'Please input your pin!',
        whitespace: true,
      },
    ]}
  >
    <Input />
  </Form.Item>
);

const PropertyForm = (props) => {
  const [form] = Form.useForm();
  const { submitForm, city } = props;

  const onFinish = (values) => {
    let appealType;
    if (city === 'detroit') {
      appealType = 'detroit_single_family';
    } else if (city === 'chicago') {
      appealType = 'cook_county_single_family';
    }
    const info = { ...values, appeal_type: appealType };
    console.log('Received values of form: ', info);
    submitForm(info);
  };

  return (
    <Form
      form={form}
      name="Housing Information"
      onFinish={onFinish}
      labelAlign="left"
      // initialValues={}
      scrollToFirstError
      autoComplete="off"
      {...formItemLayout}
    >
      <Row>
        <Col xs={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
          <h1>Property information form</h1>
          <p>Fill out this form and submit to see comparable value properties</p>
          <br />
        </Col>
      </Row>
      {/* <Form.Item
        label="Appeal Type"
        name="appeal_type"
        rules={[
          {
            required: true,
            message: 'Please select the type of appeal you would like to file.',
          },
        ]}
      >
        <Radio.Group>
          <Radio.Button value="cook_county_single_family">Cook County Single Family</Radio.Button>
          <Radio.Button value="detroit_single_family">Detroit Single Family</Radio.Button>
        </Radio.Group>
      </Form.Item> */}

      <Form.Item noStyle>
        <PinForm />
        <HomeownerInfo />
      </Form.Item>

      <Form.Item {...tailFormItemLayout}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PropertyForm;
