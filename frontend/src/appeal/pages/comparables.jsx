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

//show comparables
const CharacteristicsTable = (props) => {
  const {
    comparablesPool,
    headers,
    logComparables,
    back,
  } = props;

  const [candidates, setCandidates] = useState([]);
  const [selectedComparables, setSelected] = useState([]);
  const [showSelected, setShowSelected] = useState(false);

  if((candidates === undefined || candidates.length === 0) && selectedComparables.length === 0){
    setCandidates(comparablesPool); //initialize comparables pool
  }

  if(selectedComparables.length > 0 && showSelected === false){
    setShowSelected(true); //show selected once one is selected
  }
 
  const advancePage = () => {//add up to exactly five on advance, update on submit
    while(selectedComparables.length < 5){
      selectedComparables.push(comparablesPool.shift())
    } 
    logComparables(selectedComparables);
  };

  const excludeColumns = ['PIN', 'total_sqft', 'total_acre', 'Total Floor Area',
                          'score'];

  let Columns = [];
  for (const header of headers) {
    if( excludeColumns.includes(header) === false ){
      Columns.push(<Column title={createTitle(header)} dataIndex={header} key={header} />)
    }
  }
  Columns = Columns.sort();

  return (
    <>
      {showSelected && 
      <>
        <h3>Your Selected Comparables</h3>
        <p>This table includes properties you have selected as comparables to yours. Click 'Delete' to remove the property from your selection.</p>
      </>
      }
      <Table dataSource={selectedComparables} 
        scroll={{ x: true }}
        style={showSelected ? { display: ''} : {display: 'none'}}
      >
        {Columns}
        <Column
          title="Action"
          key="action"
          render={(record) => (
          <Button 
            danger
            onClick={() => {
              setSelected(selectedComparables.filter(candidate => candidate.PIN !== record.PIN));
              setCandidates(candidates.concat(record));
            }}
          >
            Delete
          </Button>
          )}
        />
      </Table>
      <h3>Properties Recently Sold Near You</h3>
      <p>This table includes properties which might be similar to yours. Click 'Add' to add the property to your selected comparables.</p>
      <Table 
        dataSource={candidates} 
        scroll={{ x: true }}
      >
        {Columns}
        <Column
          title="Action"
          key="action"
          render={(record) => (
          <Button 
            primary
            onClick={() => {
              if(selectedComparables.length >= 5){
                alert('You may only add up to 5 comparables. In order to continue adding this property, you must remove one you have already added.')
              } else{
                setCandidates(candidates.filter(candidate => candidate.PIN !== record.PIN));
                setSelected(selectedComparables.concat(record));
              }
            }}
          >
            Add
          </Button>
          )}
        />
      </Table>
      <Space>
        <Button type="danger" onClick={back}>Back</Button>
        {showSelected && 
        <Button type="primary" onClick={advancePage}>Next Page</Button>
        }
      </Space>
    </>
  );
};

const Characteristics = (props) => {
  const {
    comparablesPool,
    headers,
    targetProperty,
    propInfo,
    logComparables,
    back,
  } = props;

  return (
    <>
      <PropertyInfo 
        targetProperty={targetProperty} 
        cols={5}
        propInfo={propInfo} />
      <Divider />
      <Row>
        <Col xs={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
          <h1>Pick the 5 properties that are the most similar to your property.</h1>
          <p>It is okay if you are unsure, your advocate will talk with you about this more. Do your best to pick the 5 properties that seem most similar to yours.</p>
          <p>Below is an automatically generated list of homes in your area that have recently sold. This information is part of what the City uses to determine the “Assessed Value” on your property tax bill. It is really important the City only consider recent home sale values of properties that are the most similar to yours.</p>
          <p>The top five comparables will be submitted even if you select less than five.</p>
        </Col>
      </Row>
      <CharacteristicsTable
        comparablesPool={comparablesPool}
        headers={headers}
        logComparables={logComparables}
        back={back}
      />
      <br></br>
      <p>Page 4 of 5</p>
    </>
  );
};

export default Characteristics;
