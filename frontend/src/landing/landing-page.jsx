import React from 'react';
import { Button, Space } from 'antd';
import { Link } from 'react-router-dom';

const PTAPHeader = () => (
  <>
    <h2>Welcome to the Property Tax Appeal Project&apos;s automated appeal system landing page.</h2>
    <p>We currently have automated appeal systems for Detroit and Chicago.</p>
    <p>Click one of the buttons to get started with your appeal.</p>
    <Space>
      <Button><Link to="/detroit">Detroit</Link></Button>
      <Button><Link to="/chicago">Chicago</Link></Button>
    </Space>
  </>
);

export default PTAPHeader;
