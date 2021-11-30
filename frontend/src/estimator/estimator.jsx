import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import EligibilityRequirements from './pages/eligibility-requirements';

const Estimator = (props) => {
  const { city } = props;

  const [pin, setPin] = useState(null);
  const [sessionUuid, setUuid] = useState([]);
  const [reportedEligibility, setEligibility] = useState(null); /*boolean for elig. status*/
  const history = useHistory(); /*allow redirects*/


  let view = (
    <EligibilityRequirements
      logPin={(selectedPin) => { setPin(selectedPin); }}
      city={city}
      logUuid={(givenUuid) => { setUuid(givenUuid); }}
      logEligibility={(givenEligibility) => { setEligibility(givenEligibility); }}
    />
  );


  if (reportedEligibility != null && reportedEligibility === false) {
    history.push("/illegalforeclosures");
  }

  return view;
};

export default Estimator;
