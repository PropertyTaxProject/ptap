import React, { useState } from 'react';
import {
  Form,
  Button,
  Table,
  Divider,
} from 'antd';

const { Column } = Table;
const re = /(\b[a-z](?!\s))/g;
const createTitle = (title) => title.replace('_', ' ').replace(re, (x) => x.toUpperCase());

//show comparables
const CharacteristicsTable = (props) => {
  const {
    comparablesPool,
    headers,
    propInfo,
    targetProperty,
    setComparables
  } = props;

  const [candidates, setCandidates] = useState([]);
  const [selectedComparables, setSelected] = useState([]);
  const [showSelected, setShowSelected] = useState(false);
  const [form] = Form.useForm();


  if((candidates === undefined || candidates.length === 0) && selectedComparables.length === 0){
    setCandidates(comparablesPool); //initialize comparables pool
  }

  if(selectedComparables.length > 0 && showSelected === false){
    setShowSelected(true); //show selected once one is selected
  }

  if(selectedComparables.length == 0 && showSelected === true){
    setShowSelected(false); //reshow comps
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
      <h3>Your Property Information</h3>
      <p>Below is the data that the Assessor has on file for your property.</p>
      <Table 
        dataSource={[targetProperty]} 
        scroll={{ x: true }}>
      {Columns}
      </Table>
      {propInfo}
      <Divider/>
      <h1>Step 2: Select Comparable Property</h1>
      {showSelected && 
      <>
        <h3>Your Selected Comparable</h3>
        <p>This table includes the property you have selected as comparables to yours. Click 'Delete' to remove the property from your selection to select another property.</p>
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
      <Form
          form={form}
          name="Get Comps Final"
          layout='vertical'
          onFinish={async (data) => { /*logResponse(await lookupPin({ appeal_type: appealType, ...data })); */ }}
          labelAlign="left"
          scrollToFirstError
          autoComplete="off"
        >

          <Form.Item compact>
            <Button type="primary" htmlType="submit">General Comparable Letter</Button>
          </Form.Item>
      </Form>
      {!showSelected && <p>This table includes properties which might be similar to yours. Click 'Add' on the property which is most similar.</p>}
      <Table 
        dataSource={candidates} 
        scroll={{ x: true }}
        style={!showSelected ? { display: ''} : {display: 'none'}}
      >
        {Columns}
        <Column
          title="Action"
          key="action"
          render={(record) => (
          <Button 
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
    propInfo,
    setComparables
  } = props;

  return (
    <>
      <p></p>
      <CharacteristicsTable
        propInfo={propInfo}
        targetProperty={targetProperty}
        comparablesPool={comparablesPool}
        headers={headers}
        setComparables={setComparables}
      />
    </>
  );
};

export default Characteristics;
