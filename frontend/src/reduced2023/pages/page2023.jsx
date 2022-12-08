import React, { useState } from 'react';
import { lookupPin, estimatePin } from '../../requests';
import {
  Form,
  Input,
  Button,
  Table,
} from 'antd';

import PinLookup from './pinlookup';



var submitted = false;
var selected = false;
let appealType = 'detroit_single_family';




const CompsLookup = (props) => {
  const [form] = Form.useForm();
  const { targRecord, setEstimate, set1, set2 } = props;

  return (
    <>
      <Form //this form submits select property and receives reponse back
          form={form}
          name="Eligibility"
          layout='vertical'
          onFinish={async () => {
            selected = false;
            var pin = targRecord.PIN;
            const response = await estimatePin({ appeal_type: appealType, pin });
            if (response != null) {
              set1(false);
              set2(true);
              setEstimate(response.estimate);
            }
          }}
          labelAlign="left"
          scrollToFirstError
          autoComplete="off"
        > 
        {submitted && <p>After searching for your home, please hit <b>Select</b> next to your property</p>}
        {selected && <Button type="primary" htmlType="submit">Get Estimate</Button>}
      </Form>
    </>
  );

  };

const ptapLanguage = (
  <div>
    <body>
      <br />
      If you want FREE help protesting your property tax assessment, contact the <b>Property Tax Appeal Project 
      <a href ="https://actionnetwork.org/forms/property-tax-assessment-appeal-interest-form?source=estimator_app"> here. </a></b>
      <br />
      <br />
      *Other factors may impact your tax bill such as exemptions or caps on your property's taxable value.
      To qualify for services, you must live in an owner occupied home and your home must be assessed at $100,000 or less.
    </body>
  </div>
);

const TheShow = (props) => {
  const { logPin, city, logUuid } = props;
  const [targRecord, setRecord] = useState([]);
  const [estimate, setEstimate] = useState([]);

  const [show1, set1] = useState(true);
  const [show2, set2] = useState(false);
  const [show3, set3] = useState(false);

  return (
    <>
      <h2>Comparable Property Finder</h2>  
      <p>
      This tool finds possible comparables and estimates the likelihood that your property is over-assessed. This page will not file an appeal on your behalf.
      </p>
      <p>There are three steps here to generate your comparables. First, search and select the property in the table below. 
        Second, among the five comparable properties, select the one property which is most similar. 
        Finally, you may choose to download a document which summarizes the comparables and estimated valuation.
      </p>
      {show1 && <h2>Property Search (1)</h2>}
      {show1 && <PinLookup
        city={city}
        logPin={logPin}
        logUuid={logUuid}
        setRecord={setRecord}
      />}
      <CompsLookup
        targRecord={targRecord}
        setEstimate={setEstimate}
        set1={set1}
        set2={set2}
      />
      {show2 && <div><h2>Select Comparables (2)</h2>{estimate}</div>}
      {show2 && ptapLanguage}
    

    </>
  );
};

export default TheShow;
