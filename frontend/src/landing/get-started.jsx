import React from 'react';
import { Button, Space } from 'antd';
import { Link } from 'react-router-dom';

const PTAPHeader2 = () => (
    <>
      <h2>The Process</h2>
      <ul>
        <li>Step 1: Complete this online application by February 10, 2020. If you have any problems with the application, call our hotline or email us (
          <a href='mailto:law-propertytax@umich.edu?subject=Request for Assistance'>law-propertytax@umich.edu</a>) and our staff can help you.</li>
        <li>Step 2: Once you complete the application, our team will receive a draft appeal letter.</li>
        <li>Step 3: Our team will call you to review the appeal letter.</li>
        <li>Step 4: Our team will send you a “Letter of Authorization,” which you must sign in order for us to represent you and send the appeal in on your behalf.</li>
        <li>Step 5: On February 15, 2021, our team will submit the necessary documents at the Assessor’s Review (the first stage of the appeal process).</li>
        <li>Step 6: On March 8, 2021, our team will file the appeal documents at the March Board of Review (the second stage of the appeal process).</li>
        <li>Step 7: Sometime in March, the City will send you its decision.</li>
        <li>Step 8: Our team will follow up with you to discuss other housing-related resources.</li>
      </ul>
      <Space>
        <Button><Link to="/selectregion">Agree</Link></Button>
      </Space>
    </>
  );
  
  export default PTAPHeader2;