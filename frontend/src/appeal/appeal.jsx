import React, { useState } from 'react';
import { submitAppeal, submitForm } from '../requests';
import ContactCharacteristics from './homeowner/contact-characteristics';
import ComparablesForm from './comparables/comparables';
import EligibilityRequirements from './homeowner/eligibility-requirements';

// TODO: MAKE POST REQUEST TO GRAB NEW COMPARABLE
const removeComparable = async (properties, idx) => properties.filter((ele, i) => (i !== idx));

const Appeal = (props) => {
  const { city } = props;
  const [comparables, setComparables] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [targetProperty, setTargetProperty] = useState(null);
  const [userInfo, setInfo] = useState({});
  const [pin, setPin] = useState(null);
  const [propInfo, setPropInfo] = useState([]);

  let view = (
    <EligibilityRequirements
      logPin={(selectedPin) => { setPin(selectedPin); }}
      city={city}
    />
  );

  if (pin != null) {
    view = (
      <ContactCharacteristics
        city={city}
        pin={pin}
        submitForm={async (info) => {
          const response = await submitForm(info);
          if (response != null) {
            setInfo(info);
            setComparables(response.comparables);
            setHeaders(response.labeled_headers);
            setTargetProperty(response.target_pin[0]); // TODO: pass value not list
            setPropInfo(response.prop_info)
          } else {
            // TODO: THROW ERROR
          }
        }}
        back={() => {
          setInfo({});
          setPin(null);
          setComparables([]);
          setHeaders([]);
          setTargetProperty(null);
          setPropInfo([]);
        }}
      />
    );
  }

  if (targetProperty != null) {
    view = (
      <ComparablesForm
        comparables={comparables}
        headers={headers}
        targetProperty={targetProperty}
        propInfo={propInfo}
        submitAppeal={async () => { submitAppeal(targetProperty, comparables, userInfo); }}
        removeComparable={async (idx) => {
          setComparables(await removeComparable(comparables, idx));
          console.log(`removed ${idx}`);
        }}
        back={() => {
          setInfo({});
          setComparables([]);
          setHeaders([]);
          setTargetProperty(null);
        }}
      />
    );
  }

  return view;
};

export default Appeal;
