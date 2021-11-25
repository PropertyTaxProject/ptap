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
      <h2>Detroit Over-Assessment Estimator</h2>  
      <p>
      This app estimates the likelihood that your property in Detroit is over-assessed.
      </p>
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
        
        {selected && <Button type="primary" htmlType="submit">Next Page</Button>}
        {!selected && <p>After searching for your home, please hit <b>Select</b> next to your property</p>}
      </Form>
      <br></br>
      <p>Page 1 of 5</p>
    </>
  );
};

export default Lookup;
