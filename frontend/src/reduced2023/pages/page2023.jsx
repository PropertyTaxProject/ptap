import React, { useState } from 'react';
import { submitForm } from '../../requests';
import {
  Form,
  Button,
  Divider,
} from 'antd';

import PinLookup from './pinlookup';
import Comparables from './comparables';

let appealType = 'detroit_single_family';

const CompsLookup = (props) => {
  const [form] = Form.useForm();
  const { targRecord, setStep, selected, setSelect, appealType, setComparablesPool, setHeaders,
    setTargetProperty, setPropInfo } = props;

  return (
    <>
      <Form //this mini-form submits select property and receives reponse back
          form={form}
          name="Eligibility"
          layout='vertical'
          onFinish={async () => {
            setSelect(false);
            var pin = targRecord.PIN;
            const response = await submitForm({ appeal_type: appealType, pin });
            if (response != null) {
              setComparablesPool(response.comparables);
              setHeaders(response.labeled_headers);
              setTargetProperty(response.target_pin[0]);
              setPropInfo(response.prop_info)
              setStep(2);
            }
          }
        }
          labelAlign="left"
          scrollToFirstError
          autoComplete="off"
        > 
        {selected && <Button type="primary" htmlType="submit">Get Sales Data</Button>}
      </Form>
    </>
  );

  };

const PtapLanguage = (props) => {
  const {estimate} = props;
  return(
    <>
      <h1>Is the City of Detroit Overtaxing You?</h1>
      <p>The Michigan Constitution requires that the City of Detroit assess each property at no more than 50 percent of its market value, meaning what it could sell for. <a href='http://www.legislature.mi.gov/(S(kioev32ipygkaee2kepvbbtn))/mileg.aspx?page=getobject&objectname=mcl-Article-IX-3'
           target='_blank' rel="noopener noreferrer">Click here</a> to read Article IX § 3 of the Michigan Constitution.</p>
      {estimate}
      <br></br>
      <br></br>
      <p>*Note: Other factors impact your tax bill, including exemptions and caps on your property’s taxable value. As such, our estimate might not be accurate.</p>
      <h3>File Your Tax Assessment Appeal!</h3>
      <p>
      To file on your own, submit your appeal by emailing it to <b>AssessorReview@detroitmi.gov</b> no later than February 22, 2023 (make sure to attach the evidence you downloaded from this tool!). 

      To get assistance filing your appeal, <a href ="https://actionnetwork.org/forms/property-tax-assessment-appeal-interest-form?source=app"> complete our interest form</a> to sign up for FREE assistance appealing your property taxes no later than February 15, 2023.

      </p>
  </>
  );

};

const TheShow = (props) => {
  const { logPin, city } = props;
  const [targRecord, setRecord] = useState([]);
  const [estimate, setEstimate] = useState([]);
  const [Uuid, logUuid] = useState([]);

  const [step, setStep] = useState(1);
  const [selected, setSelect] = useState(false);

  const [headers, setHeaders] = useState([]); /*headers for comp table*/
  const [comparablesPool, setComparablesPool] = useState([]); /*pool of possible comparables*/

  const [targetProperty, setTargetProperty] = useState(null);
  const [propInfo, setPropInfo] = useState([]); /*target property characteristics*/

  return (
    <>
      <h1>Welcome to the Search and Compare Tool!</h1>  
      <p>
      This tool will help you figure out whether the City of Detroit is fairly assessing your property’s value. If your property is not being fairly assessed, this tool provides you with evidence that you can use to protest your assessment and lower your tax bill.
      </p>
      <p>
      Before using this tool, we recommend that you <a href = "https://www.youtube.com/watch?v=3fLN7ZVT2CU" target='_blank' rel="noopener noreferrer">watch this video to understand your property tax assessment notice.</a> 
      </p>

      <Divider/>

      <h3>How to Use This Tool</h3>
      <p>Step 1. 	Input your address into the search bar below.</p>
      <p>Step 2. 	Select your address from the list. </p>
      <p>Step 3. 	Compare the City’s estimate of your property’s MARKET VALUE to the SALES PRICES of homes that have recently sold in your neighborhood. If the market value of your property is HIGHER than the sales prices of similar homes, the City is over assessing your property value.</p>
      <p>Step 4. 	Select the sale in your neighborhood that is most similar to your property. If you aren’t sure, pick the home that is closest to yours. Click the “Generate Appeal Evidence” button to receive the property sales data that you can attach as evidence to your property tax assessment appeal. <br></br> Tip: Make sure the property you select is not in much worse condition than your home. If you can, walk or drive by the property to check it out. </p>
      <p>Step 5. 	Submit your appeal on your own by emailing it to AssessorReview@detroitmi.gov no later than February 22, 2023 (make sure to attach the evidence you downloaded from this tool!) or completing our interest form to sign up for FREE assistance appealing your property taxes no later than February 15, 2023.</p>

      <h2>Search and Compare Tool</h2>
      <p>This tool finds sales of properties that are similar to yours in your neighborhood. The assessor refers to these sales as “Comparable Properties.” From these comparable property sales, you can tell what your property is likely worth. If the City is assessing your property as though it has a higher market value than these sales prices, the City is likely over assessing and overtaxing you.</p>
      <p>This tool does not file an appeal on your behalf.</p>

      <Divider/>
      {step == 1 && <PinLookup
        city={city}
        logPin={logPin}
        logUuid={logUuid}
        setRecord={setRecord}
        setSelect={setSelect}
        appealType={appealType}
      />}
      <CompsLookup
        targRecord={targRecord}
        setStep={setStep}
        selected={selected}
        setSelect={setSelect}
        appealType={appealType}
        setHeaders={setHeaders}
        setComparablesPool={setComparablesPool}
        setTargetProperty={setTargetProperty}
        setPropInfo={setPropInfo}
      />
      {step == 2 && 
      <Comparables
      comparablesPool={comparablesPool}
      setEstimate={setEstimate}
      headers={headers}
      targetProperty={targetProperty}
      propInfo={propInfo}
      Uuid={Uuid}
      setStep={setStep}
      />}
      {step == 3 && 
      <PtapLanguage 
      estimate={estimate}
      />}
    </>
  );
};

export default TheShow;
