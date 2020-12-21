import React from 'react';
import { Layout, Menu} from 'antd';
import umls from './UMLS_logo.jfif'
import coalition from './coalition_logo.png'

const { Header } = Layout;

const PTAPHeader = () => (
  <Header>
    <Menu theme="dark" mode="horizontal">
      <Menu.Item key="1"><a href="/">Property Tax Appeal Project</a></Menu.Item>
      <Menu.Item>
        <a href="https://illegalforeclosures.org/" target='_blank' rel="noopener noreferrer">
          <img height={50} src={coalition} style={{backgroundColor:"White"}}/>
        </a>
      </Menu.Item>
      <Menu.Item>
        <a href="https://www.law.umich.edu/Pages/default.aspx" target='_blank' rel="noopener noreferrer">
          <img height={50} src={umls} style={{backgroundColor:"White", padding:'5px'}}/>
        </a>
      </Menu.Item>
    </Menu>
  </Header>
);

export default PTAPHeader;
