import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { submitAppeal, submitForm } from '../requests';
import ContactInfo from './homeowner/contact-info';
import ReviewProperty from './homeowner/review-property';
import ComparablesForm from './comparables/comparables';
import EligibilityRequirements from './homeowner/eligibility-requirements';
import ReviewPage from './review/review-page';

const removeComparable = async (properties, idx) => properties.filter((ele, i) => (i !== idx));

const Appeal = (props) => {
  const { city } = props;
  const [comparables, setComparables] = useState([]);
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
  5) Review Page: Review Appeal

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
      <ContactInfo
        city={city}
        pin={pin}
        uuid={sessionUuid}
        eligibility={reportedEligibility}
        submitForm={async (info) => {
          const response = await submitForm(info);
          if (response != null) {
            setInfo(info);
            setComparables(response.comparables);
            setHeaders(response.labeled_headers);
            setTargetProperty(response.target_pin[0]);
            setPropInfo(response.prop_info)
          }
        }}
        back={() => {
          setInfo({});
          setPin(null);
          setComparables([]);
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
          setComparables([]);
          setHeaders([]);
          setTargetProperty(null);
        }}
      />
    );
  }

  if (reviewComps != null) {
    view = (
      <ComparablesForm
        comparables={comparables}
        headers={headers}
        targetProperty={targetProperty}
        propInfo={propInfo}
        submitAppeal={async () => { 
          setReview(true);
        }}
        removeComparable={async (idx) => {
          setComparables(await removeComparable(comparables, idx - 1));
          console.log(`removed ${idx - 1}`);
        }}
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
      <ReviewPage 
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
