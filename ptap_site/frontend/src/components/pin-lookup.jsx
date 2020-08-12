import React, { useState } from 'react';

import {
  Form,
  Input,
  Radio,
  Button,
  Row,
  Col,
  Space,
  Table,
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
  try {
    return (await (axios.post('/api_v1/pin-lookup', data))).data.response.candidates;
  } catch (err) {
    return [];
  }
};

const Lookup = (props) => {
  const [form] = Form.useForm();
  const [pins, setPin] = useState([]);

  const { logPin } = props;

  const columns = [
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Pin',
      dataIndex: 'parcel_num',
      key: 'pin',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button onClick={() => { logPin(record.parcel_num); }}>Select</Button>
      ),
    },
  ];

  return (
    <>
      <h2>Pin Lookup</h2>
      <p>Let&apos;s begin by looking up your pin.</p>
      <p style={{ width: '350px' }}>Enter your street number and street name and select the correct property from the dropdown.</p>
      <Form
        form={form}
        name="Pin Lookup"
        onFinish={async (data) => { setPin(await lookupPin(data)); }}
        labelAlign="left"
        scrollToFirstError
        autoComplete="off"
      >
        <Input.Group compact>
          <Form.Item style={{ width: '100px' }} name="st_num" rules={[{ required: true, message: 'Street name is required.' }]}>
            <Input type="number" placeholder="number" />
          </Form.Item>
          <Form.Item style={{ width: '300px' }} name="st_name" rules={[{ required: true, message: 'Street name is required.' }]}>
            <Input placeholder="street" />
          </Form.Item>
        </Input.Group>
        <Button type="primary" htmlType="submit">Lookup Pin</Button>
      </Form>
      {(pins.length !== 0
        ? (
          <>
            <br />
            <Table columns={columns} dataSource={pins} />
          </>
        )
        : null)}
    </>
  );
};

export default Lookup;
