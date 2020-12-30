import React, { useState } from 'react';
import { lookupPin } from '../../requests';
import {
  Form,
  Input,
  Button,
  Table,
  Radio
} from 'antd';

var submitted = false;
var selected = false;

const theProcess = (
  <ul>
    <li>Step 1: Complete this online application by February 10, 2020. If you have any problems with the application, call our hotline or email us (
      <a href='mailto:law-propertytax@umich.edu?subject=Request for Assistance'>law-propertytax@umich.edu</a>) and our staff can help you.</li>
    <li>Step 2: Once you complete the application, our team will receive a draft appeal letter.</li>
    <li>Step 3: Our team will call you to review the appeal letter.</li>
    <li>Step 4: Our team will send you a “Letter of Authorization,” which you must sign in order for us to represent you and send the appeal in on your behalf.</li>
    <li>Step 5: On February 15, 2021, which is the deadline, our team will submit the necessary documents at the Assessor’s Review (the first stage of the appeal process).</li>
    <li>Step 6: On March 8, 2021, our team will file the appeal documents at the March Board of Review (the second stage of the appeal process).</li>
    <li>Step 7: Sometime before June, the City will send you its decision.</li>
    <li>Step 8: Our team will follow up with you to discuss other housing-related resources.</li>
  </ul>
);

const PinLookup = (props) => {
  const [form] = Form.useForm();
  const [pins, setPin] = useState([]);
  const { logPin, city, logUuid, setRecord } = props;

  const selectPin = (record) => { //log pin
    logPin(record.PIN);
    setPin([record])
    setRecord(record);
    selected = true;
  };

  const logResponse = (theResponse) => {
    submitted = true;
    selected = false;
    try {
      setPin(theResponse.candidates);
      logUuid(theResponse.uuid);
    } catch (err) {
      setPin([]);
    }
  };

  let appealType;
  if (city === 'detroit') {
    appealType = 'detroit_single_family';
  } else if (city === 'chicago') {
    appealType = 'cook_county_single_family';
  }

  var columns = [
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
      render: (record) => (
        <Button onClick={() => { selectPin(record); }}>Select</Button>
      ),
    },
  ];

  if (selected){
    columns = [
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
        render: (record) => (
          <Button type="primary" onClick={() => { selectPin(record); }}>Selected</Button>
        ),
      },
    ];  
  }

  return (
    <>
      <Form
        form={form}
        name="Pin Lookup"
        layout='vertical'
        onFinish={async (data) => { logResponse(await lookupPin({ appeal_type: appealType, ...data })); }}
        labelAlign="left"
        scrollToFirstError
        autoComplete="off"
      >
        <p style={{ width: '350px' }}>Enter your street number and street name and select your property from the table.</p>

        <Input.Group compact>
          <Form.Item style={{ width: '100px' }} name="st_num" rules={[{ required: true, message: 'Street name is required.' }]}>
            <Input type="number" placeholder="number" />
          </Form.Item>
          <Form.Item style={{ width: '300px' }} name="st_name" rules={[{ required: true, message: 'Street name is required.' }]}>
            <Input placeholder="street" />
          </Form.Item>
          <Button htmlType="submit">Search</Button>
        </Input.Group>
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

const Lookup = (props) => {
  const [form] = Form.useForm();
  const { logPin, city, logUuid, logEligibility } = props;
  const [targRecord, setRecord] = useState([]);

  const setEligibility = () => { //determine eligibility
    var eligibility = true;
    if (form.getFieldValue('residence') !== 'Yes'){
      alert("You may not be eligible to receive our services. We only serve owner occupied homes. Please contact our hotline for more information at 313-438-8698.");
      eligibility = false;
    } else if (form.getFieldValue('owner') !== 'Yes'){
      alert("You may not be eligible to receive our services. We only serve owner occupied homes. Please contact our hotline for more information at 313-438-8698.");
      eligibility = false;
    } else if (targRecord.eligible === false){
      alert("You may not be eligible to receive our services. We only serve homes assessed below a certain threshold. Please contact our hotline for more information at 313-438-8698.");
      eligibility = false;
    }
    logEligibility(eligibility);
  };

  return (
    <>
      <h2>The Process</h2>  
      {theProcess}
      <h2>Am I eligible for free services?</h2> 
      <p>We only service owner occupied single family homes.</p>
      <p>This page collects information necessary for us to determine whether we can provide free services to you. Once you complete the application, an advocate will call you to confirm your eligibility.</p>
      <PinLookup
        city={city}
        logPin={logPin}
        logUuid={logUuid}
        setRecord={setRecord}
      />
      <Form
        form={form}
        name="Eligibility"
        layout='vertical'
        onFinish={setEligibility}
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
        
        <Button type="primary" htmlType="submit">Next Page</Button>
      </Form>
    </>
  );
};

export default Lookup;
