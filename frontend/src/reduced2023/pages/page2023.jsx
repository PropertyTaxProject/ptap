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
        {selected && <Button type="primary" htmlType="submit">Get Comparables</Button>}
      </Form>
    </>
  );

  };

const PtapLanguage = (props) => {
  const {estimate} = props;
  return(
    <>
      <h1>Next Steps</h1>
      <h2>Summary</h2>
      {estimate}
      <h3>File with Us</h3>
      <p>
      If you want FREE* help protesting your property tax assessment, contact the <b>Property Tax Appeal Project 
      <a href ="https://actionnetwork.org/forms/property-tax-assessment-appeal-interest-form?source=estimator_app"> here. </a></b>
      </p>
      <h3>Self File</h3>
      <p>
      This appendix can be used as evidence in your appeal. Forms to file can be found 
      <a href="https://detroitmi.gov/departments/office-chief-financial-officer/ocfo-divisions/office-assessor/property-assessment-appeal-information"> here.</a>
      </p>
      <br />
      *Other factors may impact your tax bill such as exemptions or caps on your property's taxable value.
      To qualify for services, you must live in an owner occupied home and your home must be assessed at $100,000 or less.
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
      <h2>Comparable Property Finder</h2>  
      <p>
      This tool finds possible comparables and estimates the likelihood that your property is over-assessed. This page will not file an appeal on your behalf.
      </p>
      <p>There are two steps to generate your comparables. First, search and select the property in the table below. 
        Second, among the five comparable properties, select the one property which is most similar. 
        Finally, you may choose to download a document which summarizes the comparables and estimated valuation to assist in filing an appeal.
      </p>
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
