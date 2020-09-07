import React, { useState } from 'react';
import { submitAppeal, submitForm } from '../requests';
import FormInput from './form-input';
import Characteristics from './characteristics';
import PinLookup from './pin-lookup';

// TODO: MAKE POST REQUEST TO GRAB NEW COMPARABLE
const removeComparable = async (properties, idx) => properties.filter((ele, i) => (i !== idx));

const Appeal = (props) => {
  const { city } = props;
  const [comparables, setComparables] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [targetProperty, setTargetProperty] = useState(null);
  const [userInfo, setInfo] = useState({});
  const [pin, setPin] = useState(null);
  let view = (
    <PinLookup
      logPin={(selectedPin) => { setPin(selectedPin); }}
      city={city}
    />
  );

  if (pin != null) {
    view = (
      <FormInput
        city={city}
        pin={pin}
        submitForm={async (info) => {
          const response = await submitForm(info);
          if (response != null) {
            setInfo(info);
            setComparables(response.comparables);
            setHeaders(response.labeled_headers);
            setTargetProperty(response.target_pin[0]); // TODO: pass value not list
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
        }}
      />
    );
  }

  if (targetProperty != null) {
    view = (
      <Characteristics
        comparables={comparables}
        headers={headers}
        targetProperty={targetProperty}
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
