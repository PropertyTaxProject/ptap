import React, { useState } from 'react';
import { submitAppeal, submitForm } from '../requests';
import FormInput from './form-input';
import Characteristics from './characteristics';
import PinLookup from './pin-lookup';

// TODO: MAKE POST REQUEST TO GRAB NEW COMPARABLE
const removeComparable = async (properties, idx) => properties.filter((ele, i) => (i !== idx));

const Appeal = () => {
  const [data, setData] = useState([]);
  const [userInfo, setInfo] = useState({});
  const [pin, setPin] = useState();
  let view = (
    <PinLookup
      logPin={(selectedPin) => { setPin(selectedPin); }}
    />
  );

  if (pin != null) {
    view = (
      <FormInput
        city="detroit"
        pin={pin}
        submitForm={(info) => submitForm(info, setData, setInfo)}
        back={() => { setPin(undefined); }}
      />
    );
  }

  if (data.length !== 0) {
    view = (
      <Characteristics
        data={data}
        submitAppeal={async () => { submitAppeal(data, userInfo); }}
        removeComparable={async (idx) => {
          setData(await removeComparable(data, idx));
          console.log(`removed ${idx}`);
        }}
        back={() => { setData([]); }}
      />
    );
  }

  return view;
};

export default Appeal;
