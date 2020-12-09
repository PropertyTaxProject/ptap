import React, { useState } from 'react';
import {
  Button,
  Table,
  Row,
  Col,
  Space,
  Divider,
  Card,
} from 'antd';

const { Column } = Table;

const re = /(\b[a-z](?!\s))/g;
const createTitle = (title) => title.replace('_', ' ').replace(re, (x) => x.toUpperCase());

// displays the comparable properties
const CharacteristicsTable = (props) => {
  const {
    comparables,
    headers,
    submitAppeal,
    removeComparable,
    back,
  } = props;
  const data = comparables;
  const [loading, setLoading] = useState(false);
  const Columns = headers.map(
    (header) => <Column title={createTitle(header)} dataIndex={header} key={header} />,
  ).sort();

  const labeledData = data.map((property, idx) => ({ property: `Comparable ${idx + 1}`, ...property }));

  return (
    <>
      <Row>
        <Col xs={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
          <h2>Pick the 5 properties that are the most similar to your property.</h2>
          <p>It is okay if you are unsure, your advocate will talk with you about this more. Do your best to pick the 5 properties that seem most similar to yours.</p>
          <p>Below is an automatically generated list of homes in your area that have recently sold. This information is part of what the City uses to determine the “Assessed Value” on your property tax bill. It is really important the City only consider recent home sale values of properties that are the most similar to yours.</p>
          <p>Delete any properties which are not comparables. The top five comparables (comparable 1 to comparable 5) will be submitted.</p>
          <br />
        </Col>
      </Row>
      <Table dataSource={labeledData} loading={loading} scroll={{ x: true }}>
        <Column title="Property" dataIndex="property" key="property" />
        {Columns}
        <Column
          title="Action"
          key="action"
          render={(text, record) => (
            record.property === 'Your Property' ? null
              : (
                <Button
                  danger
                  onClick={() => {
                    setLoading(true);
                    removeComparable(Number.parseInt(record.property.split(' ')[1], 10)).then(() => {
                      setLoading(false);
                    });
                  }}
                >
                  Delete
                </Button>
              )
          )}
        />
      </Table>
      <Space>
        <Button
          type="danger"
          onClick={back}
        >
          Back
        </Button>
        <Button
          type="primary"
          onClick={submitAppeal}
        >
          Review Information
        </Button>
      </Space>
    </>
  );
};

// displays the target property information
const PropertyInfo = (props) => {
  const { targetProperty } = props;
  const { propInfo } = props;
  const { cols } = props;
  const gridStyle = {
    width: `${Math.round(100 / cols)}%`,
    textAlign: 'center',
  };
  const characteristics = Object.entries(targetProperty).filter(([title, description]) => (
    title !== '' && description !== '' && title !== 'PIN' && title !== 'Distance'
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
          <h1>Your Property</h1>
          <p>Below is the data that we have on file for your property.</p>
          <p>{propInfo}</p>
          <br />
        </Col>
      </Row>
      {characteristics.map(([title, description]) => (
        <Card.Grid hoverable={false} style={gridStyle}>
          <Row><b>{createTitle(title)}</b></Row>
          <Row><p>{description}</p></Row>
        </Card.Grid>
      ))}
    </>
  );
};

const Characteristics = (props) => {
  const {
    comparables,
    headers,
    targetProperty,
    propInfo,
    submitAppeal,
    removeComparable,
    back,
  } = props;

  return (
    <>
      <PropertyInfo 
        targetProperty={targetProperty} 
        cols={5}
        propInfo={propInfo} />
      <Divider />
      <CharacteristicsTable
        comparables={comparables}
        headers={headers}
        removeComparable={removeComparable}
        submitAppeal={submitAppeal}
        back={back}
      />
    </>
  );
};

export default Characteristics;
