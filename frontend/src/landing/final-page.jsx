import React from 'react';
import { Button, Space } from 'antd';
import { Link } from 'react-router-dom';

const PTAPHeader4 = () => (
  <>
    <h2>Your information has now been submitted</h2>
    <p>Information will download on your appeal.</p>
    <Space>
      <Button><Link to="/illegalforeclosures">See more information on our website</Link></Button>
    </Space>
  </>
);

export default PTAPHeader4;
