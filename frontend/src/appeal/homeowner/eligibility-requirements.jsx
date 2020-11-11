import React, { useState } from 'react';

import {
  Form,
  Input,
  InputNumber,
  Button,
  Table,
  Radio
} from 'antd';

import axios from 'axios';

var submitted = false;

const lookupPin = async (data) => {
  try {
    console.log(data);
    return (await (axios.post('/api_v1/pin-lookup', data))).data.response;
  } catch (err) {
    return [];
  }
};

const Lookup = (props) => {
  const [form] = Form.useForm();
  const [pins, setPin] = useState([]);

  const { logPin, city, logUuid, logEligibility } = props;

  const logResponse = (theResponse) => {
    submitted = true;
    try {
      setPin(theResponse.candidates);
      logUuid(theResponse.uuid);
    } catch (err) {
      setPin([]);
    }
  }


  const selectPin = (record) => { //determine eligibility and log pin
    var eligibility = true;
    if (form.getFieldValue('residence') !== 'Yes'){
      alert("You may not be eligible to receive our services. Please contact our hotline at XXX-XXX-XXXX. Code: Residency");
      eligibility = false;
    } else if (form.getFieldValue('owner') !== 'Yes'){
      alert("You may not be eligible to receive our services. Please contact our hotline at XXX-XXX-XXXX. Code: Ownership");
      eligibility = false;
    } else if (record.eligibility === false){
      alert("You may not be eligible to receive our services. Please contact our hotline at XXX-XXX-XXXX. Code: Assessed Value");
      eligibility = false;
    }
    logPin(record.PIN);
    logEligibility(eligibility);
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
      dataIndex: 'Address',
      key: 'Address',
    },
    {
      title: 'Pin',
      dataIndex: 'PIN',
      key: 'pin',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
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
        layout='vertical'
        onFinish={async (data) => { logResponse(await lookupPin({ appeal_type: appealType, ...data })); }}
        labelAlign="left"
        scrollToFirstError
        autoComplete="off"
      >
        <Form.Item 
          name="residence" 
          rules={[{ required: true, message: 'Your response is required.' }]}
          label="First, is this home your primary residence, meaning the place you live most of the year?"
        >
          <Radio.Group>
            <Radio value='Yes'>Yes</Radio>
            <Radio value='No'>No</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item 
          name="owner" 
          rules={[{ required: true, message: 'Your response is required.' }]}
          label = "Second, did you inherit or buy this home?"
        >
          <Radio.Group>
            <Radio value='Yes'>Yes</Radio>
            <Radio value='No'>No</Radio>
          </Radio.Group>
        </Form.Item>

        <p style={{ width: '350px' }}></p>
        <Form.Item 
          name="owner_year" 
          rules={[{ required: true, message: 'Your response is required.' }]}
          label="Third, what year did you buy or inherit the home? (If you are not sure, it is okay to guess)"
        >
          <InputNumber min={1925} max={2021}/>
        </Form.Item>

        <p style={{ width: '350px' }}>Finally, enter your street number and street name and select your property from the table.</p>

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
        : (submitted ? 'Your property could not be found. Please try searching again.' : null))}
    </>
  );
};

export default Lookup;
