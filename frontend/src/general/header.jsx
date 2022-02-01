import React from 'react';
import { Layout, Menu} from 'antd';
import umls from './UMLS_logo.jfif'
import coalition from './coalition_logo.png'

const { Header } = Layout;

const PTAPHeader = () => (
  <Header>
    <Menu mode="horizontal">
      <Menu.Item key="1"><a href="/">Property Tax Appeal Project</a></Menu.Item>
      <Menu.Item>
        <a href="https://illegalforeclosures.org/" target='_blank' rel="noopener noreferrer">
          <img height={50} alt='Coalition Logo' src={coalition}/>
        </a>
      </Menu.Item>
      <Menu.Item disabled={true}><span style={{color:'black'}}>Call 313-438-8698 or email us at law-propertytax@umich.edu</span></Menu.Item>
    </Menu>
  </Header>
);

export default PTAPHeader;
