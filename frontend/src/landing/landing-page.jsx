import React from 'react';
import { Button, Space } from 'antd';
import { Link } from 'react-router-dom';

const PTAPHeader = () => (
  <>
    <h2>Welcome to the Property Tax Appeal Project&apos;s automated appeal system.</h2>

    <h2>The Tax Foreclosure Crisis</h2>
    <p>Information on the crisis.</p>
    <h2>Why should you appeal?</h2>
    <p>Answer the question.</p>
    <Space>
      <Button><Link to="/getstarted">Get Started with Your Appeal!</Link></Button>
    </Space>
  </>
);

export default PTAPHeader;
