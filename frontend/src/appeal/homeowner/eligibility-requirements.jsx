import React, { useState } from 'react';

import {
  Form,
  Input,
  Button,
  Table,
  Radio
} from 'antd';

import axios from 'axios';

var submitted = false;

const lookupPin = async (data) => {
  try {
    console.log(data);
    submitted = true;

    return (await (axios.post('/api_v1/pin-lookup', data))).data.response.candidates;
  } catch (err) {
    return [];
  }
};



const Lookup = (props) => {
  const [form] = Form.useForm();
  const [pins, setPin] = useState([]);

  const { logPin, city } = props;

  const selectPin = (record) => { //determine eligibility and log pin
    if (form.getFieldValue('residence') !== 'Yes'){
      alert("You may not be eligible to receive our services. Please contact our hotline at XXX-XXX-XXXX. Code: Residency");
    } else if (form.getFieldValue('owner') !== 'Yes'){
      alert("You may not be eligible to receive our services. Please contact our hotline at XXX-XXX-XXXX. Code: Ownership");
    } else if (record.eligibility === false){
      alert("You may not be eligible to receive our services. Please contact our hotline at XXX-XXX-XXXX. Code: Assessed Value");
    }
    logPin(record.parcel_num);
  };

  // TODO: Centralize this mapping
  let appealType;
  if (city === 'detroit') {
    appealType = 'detroit_single_family';
  } else if (city === 'chicago') {
    appealType = 'cook_county_single_family';
  }

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
        //<Button onClick={() => { logPin(record.parcel_num); }}>Select</Button>
        <Button onClick={() => { selectPin(record); }}>Select</Button>
      ),
    },
  ];

  return (
    <>
      <h2>Eligibility Requirements</h2>
      <p>Let&apos;s begin by determining if you are eligibile for our services.</p>

      <Form
        form={form}
        name="Pin Lookup"
        onFinish={async (data) => { setPin(await lookupPin({ appeal_type: appealType, ...data })); }}
        labelAlign="left"
        scrollToFirstError
        autoComplete="off"
      >
        <p style={{ width: '350px' }}>First, is this home your primary residence, meaning the place you live most of the year?</p>
        <Form.Item name="residence" rules={[{ required: true, message: 'Your response is required.' }]}>
          <Radio.Group>
            <Radio value='Yes'>Yes</Radio>
            <Radio value='No'>No</Radio>
          </Radio.Group>
        </Form.Item>

        <p style={{ width: '350px' }}>Second, did you inherit or buy this home?</p>
        <Form.Item name="owner" rules={[{ required: true, message: 'Your response is required.' }]}>
          <Radio.Group>
            <Radio value='Yes'>Yes</Radio>
            <Radio value='No'>No</Radio>
          </Radio.Group>
        </Form.Item>

        <p style={{ width: '350px' }}>Third, enter your street number and street name and select your property from the table.</p>

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
        : (submitted ? 'Your property could not be found.' : null))}
    </>
  );
};

export default Lookup;
