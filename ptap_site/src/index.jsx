import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Layout, Menu } from 'antd';
import axios from 'axios';
import FormInput from './components/form-input';
import * as serviceWorker from './serviceWorker';

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

ReactDOM.render(
  <React.StrictMode>
    <Layout className="layout">
      <Header>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']}>
          <Menu.Item key="1">PTAP</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">
          <FormInput submitForm={submitForm} />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Property Tax Appeal Project</Footer>
    </Layout>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
