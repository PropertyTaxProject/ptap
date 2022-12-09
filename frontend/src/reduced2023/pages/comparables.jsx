import React, { useState } from 'react';
import {
  Button,
  Table,
  Row,
  Col,
  Divider,
} from 'antd';
import PropertyInfo from '../../appeal/shared/property-info';

const { Column } = Table;
const re = /(\b[a-z](?!\s))/g;
const createTitle = (title) => title.replace('_', ' ').replace(re, (x) => x.toUpperCase());

//show comparables
const CharacteristicsTable = (props) => {
  const {
    comparablesPool,
    headers,
    propInfo
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
      <h2>Your Property Information</h2>
      <p>Below is the data that the Assessor has on file for your property.</p>
      <Table 
        dataSource={propInfo} 
        scroll={{ x: true }}
      >
        {Columns}
        <Column
          title="Action"
          key="action"
        />
      </Table>
      <Divider/>
      {showSelected && 
      <>
        <h2>Your Selected Comparable</h2>
        <p>This table includes the property you have selected as comparables to yours. Click 'Delete' to remove the property from your selection.</p>
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
      <p>This table includes properties which might be similar to yours. Click 'Add' on the property which is most similar.</p>
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
              if(selectedComparables.length >= 1){
                alert('You may only select 1 comparable. In order to continue adding this property, you must remove one you have already added.')
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
    </>
  );
};

const Characteristics = (props) => {
  const {
    comparablesPool,
    headers,
    targetProperty,
    propInfo
  } = props;

  return (
    <>
      <Row>
        <Col xs={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
          <h1>Pick the property that is the most similar to your property.</h1>
          <p>It is okay if you are unsure, your advocate will talk with you about this in more detail.</p>
          <p>
          Below is a list of homes in your area that we have identified as possibly similar to your home.
          Pick one that is most similar to your home. 
          Select properties by clicking the “Add” button on the far right.
          </p>
        </Col>
      </Row>
      <CharacteristicsTable
        propInfo={propInfo}
        comparablesPool={comparablesPool}
        headers={headers}
      />
    </>
  );
};

export default Characteristics;
