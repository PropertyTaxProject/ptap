import React, { useState } from 'react';
import {
  Button,
  Table,
  Row,
  Col,
  Space,
  Divider,
} from 'antd';
import PropertyInfo from '../shared/property-info';

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
