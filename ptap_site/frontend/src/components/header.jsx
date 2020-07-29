import React from 'react';
import { Layout, Menu } from 'antd';

const { Header } = Layout;

const PTAPHeader = () => (
  <Header>
    <Menu theme="dark" mode="horizontal">
      <Menu.Item key="1"><a href="/">Property Tax Appeal Project: Automated Appeal System</a></Menu.Item>
    </Menu>
  </Header>
);

export default PTAPHeader;
