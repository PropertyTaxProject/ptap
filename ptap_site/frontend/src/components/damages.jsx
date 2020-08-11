import React, { useState } from 'react';
import {
  Form,
  Input,
  Radio,
  Button,
  Row,
  Col,
  Select,
  Card,
  Space,
  Upload,
  message,
} from 'antd';

import DamageInput from './damage-input';

const Damages = () => {
  const [damages, setDamages] = useState([<DamageInput id={0} key={0} />]);
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Received values of form: ', 'test');
  };

  return (
    <Form
      form={form}
      name="Housing Information"
      onFinish={onFinish}
      labelAlign="left"
      scrollToFirstError
      autoComplete="off"
    >
      {damages}
      <Space>
        <Button onClick={() => { setDamages(damages.concat([<DamageInput id={damages.length} key={damages.length} />])); }}>Add Damage</Button>
        <Button onClick={() => { setDamages(damages.slice(0, Math.max(0, damages.length - 1))); }}>Remove Damage</Button>
      </Space>
    </Form>
  );
};

export default Damages;
