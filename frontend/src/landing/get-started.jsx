import React from 'react';
import { Button, Space } from 'antd';
import { Link } from 'react-router-dom';

const PTAPHeader2 = () => (
    <>
      <h2>Who we Are</h2>
      <p>Who are we? What does this app do?</p>
      <p>Click the “Agree” button below if you want to appeal your property tax assessment with support from a UMLS homeowner advocate.</p>
      <Space>
        <Button><Link to="/selectregion">Agree</Link></Button>
      </Space>
    </>
  );
  
  export default PTAPHeader2;