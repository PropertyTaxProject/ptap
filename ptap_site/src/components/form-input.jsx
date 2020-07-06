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
    }
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

const PropertyForm = (props) => {
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
      labelAlign="left"
      initialValues={{
        identifier: 'address',
      }}
      scrollToFirstError
      autoComplete="off"
      {...formItemLayout}
    >
      <Row>
        <Col xs={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
          <h2>Property information form</h2>
          <p>Fill out this form and submit to see comparable value properties</p>
          <br />
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
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PropertyForm;
