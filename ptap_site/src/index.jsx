import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Layout, Menu } from 'antd';
import axios from 'axios';
import * as serviceWorker from './serviceWorker';
import FormInput from './components/form-input';
import Characteristics from './components/characteristics';

import 'antd/dist/antd.css';

const { Header, Content, Footer } = Layout;

const submitForm = async (info) => {
  try {
    const resp = await axios.post('/api_v1/submit', info);
    console.log(resp.data);
  } catch (e) {
    console.error(e);
  }
};

// TODO: MAKE POST REQUEST TO GRAB NEW COMPARABLE
const removeComparable = async (properties, idx) => properties.filter((ele, i) => (i !== idx));

const Page = () => {
  const [data, setData] = useState([
    {
      sqft: 2000,
      bedrooms: 2,
    },
    {
      pin: '124',
      sqft: 3000,
      bedrooms: 3,
    },
    {
      pin: '125',
      sqft: 3050,
      bedrooms: 2,
    },
  ]);
  return (
    <Layout className="layout">
      <Header>
        <Menu theme="dark" mode="horizontal">
          <Menu.Item key="1">PTAP</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '0 3vw' }}>
        <div className="site-layout-content">
          <FormInput submitForm={submitForm} />
          <Characteristics
            data={data}
            removeComparable={async (idx) => {
              setData(await removeComparable(data, idx));
              console.log(`removed ${idx}`);
            }}
          />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Property Tax Appeal Project</Footer>
    </Layout>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
