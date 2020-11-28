import React from 'react';
import {
  Button,
  Table,
  Row,
  Col,
  Space,
  Divider,
  Card,
} from 'antd';
import { Link } from 'react-router-dom';


const re = /(\b[a-z](?!\s))/g;
const createTitle = (title) => title.replace('_', ' ').replace(re, (x) => x.toUpperCase());


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
        cols,
        propInfo,
        userInfo,
        comparables,
        targetProperty,
        back,
      } = props;

    const gridStyle = {
      width: `${Math.round(100 / cols)}%`,
      textAlign: 'center',
    };
    const characteristics = Object.entries(targetProperty).filter(([title, description]) => (
      title !== '' && description !== ''
    ));
    characteristics.sort(([title1], [title2]) => {
      const t1 = title1.toLowerCase();
      const t2 = title2.toLowerCase();
      if (t1 > t2) { return 1; }
      if (t1 < t2) { return -1; }
      return 0;
    });
    return (
      <>
        <Row>
          <Col xs={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
            <h1>Your Appeal</h1>
            <p>Below is the data that we will use to construct your appeal.</p>
            <Space/>
            <h3>Your Property Information</h3>
          </Col>
        </Row>
        {characteristics.map(([title, description]) => (
          <Card.Grid hoverable={false} style={gridStyle}>
            <Row><b>{createTitle(title)}</b></Row>
            <Row><p>{description}</p></Row>
          </Card.Grid>
        ))}
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
          <Link to="/completedappeal">Confirm Information</Link>
        </Button>
      </>
    );
  };
  
const ReviewForm = (props) => {
    const {
        targetProperty,
        propInfo,
        userInfo,
        comparables,
        confirmInfo,
        back,
    } = props;
    console.log(comparables);
    return (
        <>
            <PropertyInfo2
                targetProperty={targetProperty} 
                cols={5}
                propInfo={propInfo} 
                userInfo={userInfo}
                comparables={comparables}
                confirmInfo={confirmInfo}
                back={back}
            />
        </>
    );
};
  
export default ReviewForm;