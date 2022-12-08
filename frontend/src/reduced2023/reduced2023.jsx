import React, { useState } from 'react';
import Page2023 from './pages/page2023';

const Reduced2023 = (props) => {
  const { city } = props;
  const [pin, setPin] = useState(null);
  const [sessionUuid, setUuid] = useState([]);


  let view = (
    <Page2023
      logPin={(selectedPin) => { setPin(selectedPin); }}
      city={city}
      logUuid={(givenUuid) => { setUuid(givenUuid); }}
    />
  );

  return view;
};

export default Reduced2023;
