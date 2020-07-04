import React from 'react';
import {
  Form,
  Input,
  Radio,
  Button,
  Row,
  Col,
} from 'antd';

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
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
      span: 16,
      offset: 8,
    },
  },
};

const AddressForm = () => (
  <>
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

const RegistrationForm = (props) => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Received values of form: ', values);
    props.submitForm(values);
  };

  return (
    <Form
      form={form}
      name="Housing Information"
      onFinish={onFinish}
      initialValues={{
        identifier: 'address',
      }}
      scrollToFirstError
      autoComplete="off"
      {...formItemLayout}
    >
      <Row>
        <Col xs={{ span: 24, offset: 0 }} sm={{ span: 16, offset: 8 }}>
          <h2>Property information form</h2>
          <p>Fill out this form and submit to see comparable value properties</p>
        </Col>
      </Row>
      <Form.Item
        label="Property Information"
        name="identifier"
        rules={[
          {
            required: true,
            message: 'Please select a method to identify your property.',
          },
        ]}
      >
        <Radio.Group>
          <Radio.Button value="address">Address</Radio.Button>
          <Radio.Button value="pin">Pin</Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={
          (prevValues, currentValues) => prevValues.identifier !== currentValues.identifier
        }
      >
        {({ getFieldValue }) => (getFieldValue('identifier') === 'address' ? (
          <AddressForm />
        ) : <PinForm />)}
      </Form.Item>

      <Form.Item {...tailFormItemLayout}>
        <Button type="primary" htmlType="submit">
          Register
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RegistrationForm;
