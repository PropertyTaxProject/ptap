import React from 'react';
import {
  Button,
  Table,
  Divider,
} from 'antd';
import { Link } from 'react-router-dom';
import PropertyInfo from '../shared/property-info';

const userCols = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Mailing Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'City',
    dataIndex: 'city',
    key: 'city',
  },
  {
    title: 'Zip Code',
    dataIndex: 'zip',
    key: 'zip',
  },
  {
    title: 'Preferred Contact Method',
    dataIndex: 'preferred',
    key: 'preferred',
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
];

const compCols = [
  {
    title: 'Address',
    dataIndex: 'Address',
    key: 'Address'
  },
  {
    title: 'Pin',
    dataIndex: 'PIN',
    key: 'PIN'
  },
  {
    title: 'Assessed Value',
    dataIndex: 'assessed_value',
    key: 'assessed_value'
  },
  {
    title: 'Sale Price (if available)',
    dataIndex: 'Sale Price',
    key: 'Sale Price'
  },
  {
    title: 'Sale Date',
    dataIndex: 'Sale Date',
    key: 'Sale Date'
  },
];

// displays the review page
const PropertyInfo2 = (props) => {
    const {
        confirmInfo,
        propInfo,
        userInfo,
        comparables,
        back,
      } = props;

    return (
      <>
        <Divider/>
        <h3>Your Information</h3>
        <Table dataSource={[userInfo]} columns={userCols}/>
        <Divider/>
        <h3>Your Comparables</h3>
        <Table dataSource={comparables} columns={compCols}/>
        <p>{propInfo}</p>
        <Button
          type="danger"
          onClick={back}
        >
          Back
        </Button>
        <Button
          type="primary"
          onClick={confirmInfo}
        >
          <Link to="/completedappeal">Finalize Appeal</Link>
        </Button>
      </>
    );
  };
  
const ReviewAppeal = (props) => {
    const {
        targetProperty,
        propInfo,
        userInfo,
        comparables,
        confirmInfo,
        back,
    } = props;
    return (
        <>  <h1>Your Appeal</h1>
            <PropertyInfo 
              targetProperty={targetProperty} 
              cols={5}
              propInfo={propInfo}
            />
            <PropertyInfo2
                confirmInfo={confirmInfo}
                propInfo={propInfo} 
                userInfo={userInfo}
                comparables={comparables}
                back={back}
            />
        </>
    );
};
  
export default ReviewAppeal;