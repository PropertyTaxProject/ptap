import React from 'react';
import { Button, Space } from 'antd';
import { Link } from 'react-router-dom';

const PTAPHeader4 = () => (
  <>
    <h2>Your application has now been submitted</h2>
    <p>What to Expect Next? Our team will contact you before the Feb. 15th deadline to complete your appeal. 
      In the meantime, if you have any questions you can reach us at our hotline (INSERT NUMBER) or at&nbsp;
      <a href='mailto:law-propertytax@umich.edu?subject=Questions after Submission'>law-propertytax@umich.edu</a>. 
    </p>
    <ul>
        <li> <b>&#10003; You are Here!</b> Step 1: Complete this online application by February 10, 2020.</li>
        <li>Step 2: Once you complete the application, our team will receive a draft appeal letter.</li>
        <li>Step 3: Our team will call you to review the appeal letter.</li>
        <li>Step 4: Our team will send you a “Letter of Authorization,” which you must sign in order for us to represent you and send the appeal in on your behalf.</li>
        <li>Step 5: On February 15, 2021, our team will submit the necessary documents at the Assessor’s Review (the first stage of the appeal process).</li>
        <li>Step 6: On March 8, 2021, our team will file the appeal documents at the March Board of Review (the second stage of the appeal process).</li>
        <li>Step 7: Sometime in March, the City will send you its decision.</li>
        <li>Step 8: Our team will follow up with you to discuss other housing-related resources.</li>
      </ul>
    <Space>
      <Button type="primary"><Link to="/illegalforeclosures">See more information on our website</Link></Button>
    </Space>
  </>
);

export default PTAPHeader4;
