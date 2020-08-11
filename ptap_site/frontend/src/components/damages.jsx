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
  const [damages, setDamages] = useState([]);
  return (
    <>
      {damages}
      <Space>
        <Button onClick={() => { setDamages(damages.concat([<DamageInput key={damages.length} />])); }}>Add Damage</Button>
        <Button onClick={() => { setDamages(damages.slice(0, Math.max(0, damages.length - 1))); }}>Remove Damage</Button>
      </Space>
    </>
  );
};

export default Damages;
