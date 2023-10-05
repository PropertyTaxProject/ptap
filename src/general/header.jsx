import React from "react"
import { Layout, Menu } from "antd"
import coalition from "./coalition_logo.png"

const { Header } = Layout

const PTAPHeader = () => (
  <Header>
    <Menu mode="horizontal">
      <Menu.Item key="1">
        <a href="/">Property Tax Appeal Project</a>
      </Menu.Item>
      <Menu.Item>
        <a
          href="https://illegalforeclosures.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img height={50} alt="Coalition Logo" src={coalition} />
        </a>
      </Menu.Item>
      <Menu.Item disabled={true}>
        <span style={{ color: "black" }}>Call or text us at: 313-329-7610</span>
      </Menu.Item>
      <Menu.Item disabled={true}>
        <span style={{ color: "black" }}>
          Email us at: propertytax@streetdemocracy.org
        </span>
      </Menu.Item>
    </Menu>
  </Header>
)

export default PTAPHeader
