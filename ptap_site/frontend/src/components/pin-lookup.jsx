import React from 'react';

import {
  Form,
  Input,
  Radio,
  Button,
  Row,
  Col,
} from 'antd';

import axios from 'axios';

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

const lookupPin = async (data) => {
  console.log(data);
  const resp = await axios.post('/api_v1/pin-lookup', data);
  console.log(resp.data);
};

const Lookup = (props) => {
  const [form] = Form.useForm();
  return (
    <Form
      form={form}
      name="Pin Lookup"
      onFinish={lookupPin}
      labelAlign="left"
      scrollToFirstError
      autoComplete="off"
      {...formItemLayout}
    >
      <Input.Group compact>
        <Form.Item name="st_name" noStyle rules={[{ required: true, message: 'Street name is required.' }]}>
          <Input placeholder="street" />
        </Form.Item>
        <Form.Item name="st_num" noStyle rules={[{ required: true, message: 'Street name is required.' }]}>
          <Input type="number" placeholder="number" />
        </Form.Item>
        <Button type="primary" htmlType="submit">Lookup Pin</Button>
      </Input.Group>
    </Form>
  );
};

export default Lookup;
