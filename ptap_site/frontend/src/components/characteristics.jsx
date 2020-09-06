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

import PropTypes from 'prop-types';

const { Column } = Table;

const re = /(\b[a-z](?!\s))/g;
const createTitle = (title) => title.replace('_', ' ').replace(re, (x) => x.toUpperCase());

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

  // const headers = {};
  // for (let i = 0; i < data.length; i += 1) {
  //   const property = data[i];
  //   Object.keys(property).forEach((header) => {
  //     headers[header] = 1;
  //   });
  // }

  const Columns = headers.map(
    (header) => <Column title={createTitle(header)} dataIndex={header} key={header} />,
  ).sort();

  const labeledData = data.map((property, idx) => ({ property: `Comparable ${idx}`, ...property }));

  return (
    <>
      <Row>
        <Col xs={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
          <h1>Select relevant comparables</h1>
          <p>Delete comparables you do not wish to include in your appeal.</p>
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
          Generate Appeal
        </Button>
      </Space>
    </>
  );
};

// displays the target property information
const PropertyInfo = (props) => {
  const { targetProperty } = props;
  const { cols } = props;
  const gridStyle = {
    width: `${Math.round(100 / cols)}%`,
    textAlign: 'center',
  };
  const characteristics = Object.entries(targetProperty).filter(([title, description]) => (
    title !== '' && description !== ''
  ));

  return (
    <>
      <Row>
        <Col xs={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
          <h1>Your Property</h1>
          <p>Below is the data that we have on file for your property.</p>
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
    submitAppeal,
    removeComparable,
    back,
  } = props;

  return (
    <>
      <PropertyInfo targetProperty={targetProperty} cols={5} />
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
