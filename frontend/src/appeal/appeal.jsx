import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { submitAppeal, submitForm } from '../requests';
import HomeownerInfo from './pages/contact-info';
import ReviewProperty from './pages/review-property';
import ComparablesForm from './pages/comparables';
import EligibilityRequirements from './pages/eligibility-requirements';
import ReviewAppeal from './pages/review-appeal';

const Appeal = (props) => {
  const { city } = props;
  const [comparables, setComparables] = useState([]); /*selected comparables*/
  const [comparablesPool, setComparablesPool] = useState([]); /*pool of possible comparables*/
  const [headers, setHeaders] = useState([]); /*headers for comp table*/
  const [targetProperty, setTargetProperty] = useState(null);
  const [userInfo, setInfo] = useState({}); /*inputted user info*/
  const [userPropInfo, setUserPropInfo] = useState({}); /*inputted user prop info*/
  const [pin, setPin] = useState(null);
  const [propInfo, setPropInfo] = useState([]); /*target property characteristics*/
  const [sessionUuid, setUuid] = useState([]);
  const [reportedEligibility, setEligibility] = useState(null); /*boolean for elig. status*/
  const [reviewAppeal, setReview] = useState(null); /*boolean to adv to review page*/
  const [reviewComps, setReviewComps] = useState(null); /*boolean to adv to comps page*/
  const history = useHistory(); /*allow redirects*/
  /*
  Appeal has a series of pages viewed in seq order
  
  1) Eligibility Requirements (Default): Find pin and sets uuid
  2) Contact Info: Collects Contact Info
  3) Review Property: Review Selected Property Information
  4) Comparables: Select Comparables
  5) Review Appeal: Review Appeal

  */

  let view = (
    <EligibilityRequirements
      logPin={(selectedPin) => { setPin(selectedPin); }}
      city={city}
      logUuid={(givenUuid) => { setUuid(givenUuid); }}
      logEligibility={(givenEligibility) => { setEligibility(givenEligibility); }}
    />
  );

  if (reportedEligibility != null && reportedEligibility === true) {
    view = (
      <HomeownerInfo
        city={city}
        pin={pin}
        uuid={sessionUuid}
        eligibility={reportedEligibility}
        submitForm={async (info) => {
          const response = await submitForm(info);
          if (response != null) {
            setInfo(info);
            setComparablesPool(response.comparables);
            setHeaders(response.labeled_headers);
            setTargetProperty(response.target_pin[0]);
            setPropInfo(response.prop_info)
          }
        }}
        back={() => {
          setInfo({});
          setPin(null);
          setComparablesPool([]);
          setHeaders([]);
          setTargetProperty(null);
          setPropInfo([]);
          setEligibility(null);
        }}
      />
    );
  }

  if (targetProperty != null) {
    view = (
      <ReviewProperty
        targetProperty={targetProperty}
        propInfo={propInfo}
        submitPropReview={async (info) => { 
          setReviewComps(true);
          setUserPropInfo(info);
        }}
        back={() => {
          setInfo({});
          setComparablesPool([]);
          setHeaders([]);
          setTargetProperty(null);
        }}
      />
    );
  }

  if (reviewComps != null) {
    view = (
      <ComparablesForm
        comparablesPool={comparablesPool}
        headers={headers}
        targetProperty={targetProperty}
        propInfo={propInfo}
        logComparables={(selectedComparables) => { setComparables(selectedComparables); setReview(true); }}
        back={() => {
          setInfo({});
          setComparables([]);
          setHeaders([]);
          setReviewComps(null);
        }}
      />
    );
  }

  if (reviewAppeal != null) {
    view = (
      <ReviewAppeal 
        targetProperty={targetProperty} 
        propInfo={propInfo} 
        userInfo={userInfo}
        comparables={comparables}
        confirmInfo={() => {
          submitAppeal(targetProperty, comparables, userInfo, userPropInfo, sessionUuid);
        }}
        back={() => {
          setReview(null);
        }}
      />
    );
  }

  if (reportedEligibility != null && reportedEligibility === false) {
    history.push("/illegalforeclosures");
  }

  return view;
};

export default Appeal;
