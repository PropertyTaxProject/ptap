import React, { useState } from 'react';
import {
  Form,
  Button,
  Row,
  Col,
  Space,
  Card,
  Divider,
  Input,
  Radio
} from 'antd';

const { TextArea } = Input;
const re = /(\b[a-z](?!\s))/g;
const createTitle = (title) => title.replace('_', ' ').replace(re, (x) => x.toUpperCase());

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

// displays the target property information
const PropertyInfo = (props) => {
  const { targetProperty } = props;
  const { propInfo } = props;
  const { cols } = props;
  const gridStyle = {
    width: `${Math.round(100 / cols)}%`,
    textAlign: 'center',
  };
  const characteristics = Object.entries(targetProperty).filter(([title, description]) => (
    title !== '' && description !== '' && title !== 'PIN' && title !== 'Distance'
  ));
  characteristics.sort(([title1], [title2]) => {
    const t1 = title1.toLowerCase();
    const t2 = title2.toLowerCase();
    if (t1 > t2) { return 1; }
    if (t1 < t2) { return -1; }
    return 0;
  });
  return (
    <>
      <Row>
        <Col xs={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
          <h1>Your Property</h1>
          <p>Below is the data that we have on file for your property.</p>
          <p>{propInfo}</p>
          <br />
        </Col>
      </Row>
      {characteristics.map(([title, description]) => (
        <Card.Grid hoverable={false} style={gridStyle}>
          <Row><b>{createTitle(title)}</b></Row>
          <Row><p>{description}</p></Row>
        </Card.Grid>
      ))}
    </>
  );
};

const Characteristics = (props) => {
  const {
    targetProperty,
    propInfo,
    submitPropReview,
    back,
  } = props;

  const [form] = Form.useForm();
  const [showCharInput, updateCharInput] = useState(false);


  const onFinish = (info) => {
    console.log('Received values of form: ', info);
    submitPropReview(info);
  };

  return (
    <>
      <PropertyInfo 
        targetProperty={targetProperty} 
        cols={5}
        propInfo={propInfo}
      />
      <Divider />

      <Form
        form={form}
        name="Housing Information"
        onFinish={onFinish}
        labelAlign="left"
        scrollToFirstError
        autoComplete="off"
        {...formItemLayout}
      >
        <Row>
          <Col xs={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}></Col>
        </Row>
        <Form.Item 
          name="validcharacteristics" 
          rules={[{ required: true, message: 'Your response is required.' }]}
          label = "Are these characteristics correct?"
        >
          <Radio.Group onChange={e => updateCharInput(e.target.value)}>
            <Radio value='Yes'>Yes</Radio>
            <Radio value='No'>No</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="characteristicsinput"
          label="What about these characteristics is incorrect?"
          style={showCharInput === 'No' ? { display: ''} : {display: 'none'}}
        >
          {showCharInput === 'No' && <TextArea placeholder="Please provide as much information as you can." rows={4}/>}
        </Form.Item>
               
        <Form.Item
        name="valueestimate"
        label="How much do you think your house would sell for right now, as is? (If you are not sure, go ahead and provide a guesstimate)"
        rules={[
          {
            required: true,
            message: 'Please enter a response!',
          },
        ]}
        >
          <Input placeholder='Your best estimate.' />
        </Form.Item>
               
        <Form.Item>
          <Space>
            <Button type="danger" onClick={back} >Back</Button>
            <Button type="primary" htmlType="submit">Submit</Button>
          </Space>
        </Form.Item>
      </Form>
    </>
  );
};

export default Characteristics;
