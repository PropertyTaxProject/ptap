import React, { useState } from 'react';
import { lookupPin } from '../../requests';
import {
  Form,
  Input,
  Button,
  Table,
  Radio,
  Badge
} from 'antd';

var submitted = false;
var selected = false;

const theProcessDetroit = (
  <ul>
    <li><b>Step 1</b>: Complete this online application by <b>February 15, 2022</b>. If you are unable to complete the Application or have questions, call or text our hotline (313-438-8698) or email us &nbsp; 
      <a href='mailto:law-propertytax@umich.edu?subject=Request for Assistance'>(law-propertytax@umich.edu)</a>.</li>
    <li><b>Step 2</b>: An advocate will call you to review your Application and will let you know whether we can help you.</li>
    <li><b>Step 3</b>: If your Application is accepted, you will need to sign a Letter of Authorization form. The Project will provide you with this form.</li>
    <li><b>Step 4</b>: If your Application is accepted, an advocate will work with you to complete your appeal documents.</li>
    <li><b>Step 5</b>: Your advocate will submit your documents to the Assessor’s Review by <b>February 22, 2022.</b></li>
    <li><b>Step 6</b>: Your advocate will submit your documents to the March Board of Review by <b>March 8, 2022.</b></li>
    <li><b>Step 7</b>: Before <b>June of 2022</b>, the Board of Review will send you a letter notifying you whether your home's assessed value is reduced because of your appeal.</li>
  </ul>
);

const theProcessCook = (
  <ul>
    <li><b>Step 1</b>: Contact the Coalition for Property Tax Justice and work with an advocate to complete this Application. If you have questions, email us: &nbsp; 
      <a href='mailto:chicagoptap@gmail.com?subject=Request for Assistance'>chicagoptap@gmail.com</a>.</li>
    <li><b>Step 2</b>: Review your eligibility for services with an advocate.</li>
    <li><b>Step 3</b>: If your Application is accepted, an advocate will work with you to carefully review your application. At this stage, you must send your advocate pictures of any repairs your home may need, as this can help lower your assessment.</li>
    <li><b>Step 4</b>: Your advocate will send your appeal letter to Dentons Law Firm. The attorneys at Dentons will contact you to complete and file your appeal.</li>
    <li><b>Step 5</b>: Dentons will submit your appeal to the Board of Review and notify you of the outcome.</li>
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
        <p style={{ width: '400px' }}>Enter your street number and street name below and then hit search. After searching from your home, hit the <b>Select button</b> next to your address</p>

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
      alert("You may not be eligible to receive our services. We only serve owner occupied homes. Please contact us for more information.");
      eligibility = false;
    } else if (form.getFieldValue('owner') !== 'Yes'){
      alert("You may not be eligible to receive our services. We only serve owner occupied homes. Please contact us for more information.");
      eligibility = false;
    } else if (targRecord.eligible === false){
      alert("You may not be eligible to receive our services. We only serve homes assessed below a certain threshold. Please contact us for more information.");
      eligibility = true;
    }
    logEligibility(eligibility);
  };

  return (
    <>
      <p>
      <b>Disclaimer:</b> Completing this Application does not guarantee that the Project will be able to represent you. 
      The information you provide will help the Project determine if we can assist you. After completing this Application, 
      the Project will try to contact you three times. If we don’t hear from you after three attempts, we will remove you from our list.
      </p>
      <h2>The Appeals Process</h2>  
      <p>
      Here is a general overview of the appeals process:
      </p>
      {city == "detroit" && theProcessDetroit}
      {city == "chicago" && theProcessCook}

      <h2>Who is Eligible for the Project's Services?</h2> 
      <p>
      You are eligible for services if you meet all of these criteria:
      </p>
      {city == "detroit" &&
      <ul>
        <li>You own a home in the City of Detroit.</li>
        <li>You occupy that home as your permanent residence.</li>
        <li>Your home is worth $100,000 or less.</li>
      </ul>
      }
      {city == "chicago" &&
      <ul>
        <li>You own a home in Cook County.</li>
        <li>You occupy that home as your permanent residence.</li>
        <li>Your home is worth $225,000 or less.</li>
      </ul>
      }
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
        <h2>Find Your Home</h2>
        <PinLookup
        city={city}
        logPin={logPin}
        logUuid={logUuid}
        setRecord={setRecord}
        />
        
        {selected && <Button type="primary" htmlType="submit">Next Page</Button>}
        {!selected && <p>After searching for your home, please hit <b>Select</b> next to your property</p>}
      </Form>
      <br></br>
      <p>Page 1 of 5</p>
    </>
  );
};

export default Lookup;
