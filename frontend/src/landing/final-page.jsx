import React from 'react';
import { Button, Space } from 'antd';
import { Link } from 'react-router-dom';

const PTAPHeader4 = () => (
  <>
    <h2>Your application has now been submitted.</h2>
    <p><b>What to expect next?</b></p>
    <p>Our team will contact you before the Feb. 15th deadline to complete your appeal. 
      In the meantime, if you have any questions you can reach us at our hotline 313-438-8698 or at&nbsp;
      <a href='mailto:law-propertytax@umich.edu?subject=Questions after Submission'>law-propertytax@umich.edu</a>. 
    </p>
    <ul>
      <li> <b>&#10003; You are Here!</b> <b>Step 1</b>: Complete this online application by <b>February 15, 2022</b>.</li>
      <li><b>Step 2</b>: An advocate will call you to review your Application and will let you know whether we can help you.</li>
      <li><b>Step 3</b>: If your Application is accepted, an advocate will work with you to complete your appeal documents.</li>
      <li><b>Step 4</b>: Your advocate will submit your documents to the Assessor’s Review by <b>February 22, 2022</b></li>
      <li><b>Step 5</b>: Your advocate will submit your documents to the March Board of Review by <b>March 8, 2022</b></li>
      <li><b>Step 6</b>: Before <b>June of 2022</b>, the Board of Review will send you a letter notifying you whether your home's assessed value is reduced because of your appeal.</li>
    </ul>
    <Space>
      <Button type="primary"><Link to="/illegalforeclosures">See more information on our website</Link></Button>
    </Space>
  </>
);

export default PTAPHeader4;
