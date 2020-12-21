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
      <h2>The Process</h2>
        <ul>
          <li>Step 1: Complete this online application by February 10, 2020. If you have any problems with the application, call our hotline or email us (
            <a href='mailto:law-propertytax@umich.edu?subject=Request for Assistance'>law-propertytax@umich.edu</a>) and our staff can help you.</li>
          <li>Step 2: Once you complete the application, our team will receive a draft appeal letter.</li>
          <li>Step 3: Our team will call you to review the appeal letter.</li>
          <li>Step 4: Our team will send you a “Letter of Authorization,” which you must sign in order for us to represent you and send the appeal in on your behalf.</li>
          <li>Step 5: On February 15, 2021, which is the deadline, our team will submit the necessary documents at the Assessor’s Review (the first stage of the appeal process).</li>
          <li>Step 6: On March 8, 2021, our team will file the appeal documents at the March Board of Review (the second stage of the appeal process).</li>
          <li>Step 7: Sometime in March, the City will send you its decision.</li>
          <li>Step 8: Our team will follow up with you to discuss other housing-related resources.</li>
        </ul>
      <h2>Am I eligible for free services?</h2>
      <p>We only service owner occupied single family homes.</p>
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
          label="Is this home your primary residence, meaning the place you live most of the year?"
        >
          <Radio.Group>
            <Radio value='Yes'>Yes</Radio>
            <Radio value='No'>No</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item 
          name="owner" 
          rules={[{ required: true, message: 'Your response is required.' }]}
          label = "Do you own this home?"
        >
          <Radio.Group>
            <Radio value='Yes'>Yes</Radio>
            <Radio value='No'>No</Radio>
          </Radio.Group>
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
