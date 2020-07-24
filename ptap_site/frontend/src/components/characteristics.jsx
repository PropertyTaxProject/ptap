import React, { useState } from 'react';
import {
  Button,
  Table,
  Row,
  Col,
  Space,
} from 'antd';

const { Column } = Table;

const CharactaristicsTable = (props) => {
  const { data } = props;
  const [loading, setLoading] = useState(false);

  const headers = {};
  for (let i = 0; i < data.length; i += 1) {
    const property = data[i];
    Object.keys(property).forEach((header) => {
      headers[header] = 1;
    });
  }

  const re = /(\b[a-z](?!\s))/g;
  const Columns = Object.keys(headers).map((header) => {
    const title = header.replace('_', ' ').replace(re, (x) => x.toUpperCase());
    return <Column title={title} dataIndex={header} key={header} />;
  }).sort();

  const labeledData = data.map((property, idx) => ({ property: idx === 0 ? 'Your Property' : `Comparable ${idx}`, ...property }));

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
                    props.removeComparable(Number.parseInt(record.property.split(' ')[1], 10)).then(() => {
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
          onClick={props.back}
        >
          Back
        </Button>
        <Button
          type="primary"
          onClick={props.submitAppeal}
        >
          Generate Appeal
        </Button>
      </Space>
    </>
  );
};

const Characteristics = (props) => (
  <CharactaristicsTable {...props} />
);

export default Characteristics;
