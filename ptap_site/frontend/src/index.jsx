import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Layout, Menu } from 'antd';
import axios from 'axios';
import * as serviceWorker from './serviceWorker';
import FormInput from './components/form-input';
import Characteristics from './components/characteristics';
import { saveAs } from 'file-saver'


import 'antd/dist/antd.css';

const { Header, Content, Footer } = Layout;

const submitForm = async (info, setData, setInfo) => {
  try {
    const resp = await axios.post('/api_v1/submit', info);
    console.log(resp);
    const data = resp.data.response.target_pin.concat(resp.data.response.comparables);
    setData(data);
    setInfo(info)
  } catch (e) {
    console.error(e);
  }
};

const submitAppeal = async (data, userInfo) => {
  try {
    // merge our data and user info
    const target_pin = [data[0]]
    const comparables = data.slice(1)
    const body = Object.assign({}, {target_pin, comparables}, userInfo)
    console.log(body)
    const resp = await axios.post('/api_v1/submit2', body, { responseType: 'blob' })
    // saveAs()

    console.log(resp)
    // TRIGGER SUBMISSION PAGE
  } catch (e) {
    console.error(e)
  }
};

// TODO: MAKE POST REQUEST TO GRAB NEW COMPARABLE
const removeComparable = async (properties, idx) => properties.filter((ele, i) => (i !== idx));

const Page = () => {
  const a = [];
  for (let i = 0; i < 20; i += 1) {
    a.push({ sqft: Math.round(Math.random() * 10000), bedrooms: Math.round(Math.random() * 5) });
  }
  const [data, setData] = useState([]);
  const [userInfo, setInfo] = useState({})
  return (
    <Layout className="layout">
      <Header>
        <Menu theme="dark" mode="horizontal">
          <Menu.Item key="1">Property Tax Appeal Project: Automated Appeal System</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '0 3vw' }}>
        <div className="site-layout-content">
          { data.length === 0 ? <FormInput submitForm={(info) => submitForm(info, setData, setInfo)} />
            : (
              <Characteristics
                data={data}
                submitAppeal={async () => { submitAppeal(data, userInfo) }}
                removeComparable={async (idx) => {
                  setData(await removeComparable(data, idx));
                  console.log(`removed ${idx}`);
                }}
              />
            )}
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
